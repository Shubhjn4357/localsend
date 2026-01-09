import Foundation
import Network

@objc(NearDropModule)
class NearDropModule: RCTEventEmitter {
    private var listener: NWListener?
    private var browser: NWBrowser?
    private var connections: [String: NWConnection] = [:]
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    override func supportedEvents() -> [String]! {
        return ["onNearDropDeviceFound", "onNearDropFileReceived"]
    }
    
    @objc
    func startAdvertising(_ deviceName: String,
                         resolver resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Create TCP parameters
        let parameters = NWParameters.tcp
        parameters.includePeerToPeer = true
        
        // Create Bonjour service for NearDrop
        let service = NWListener.Service(name: deviceName, type: "_googlercast._tcp")
        
        do {
            // Create and start listener
            listener = try NWListener(using: parameters, on: .any)
            listener?.service = service
            
            listener?.stateUpdateHandler = { [weak self] state in
                switch state {
                case .ready:
                    if let port = self?.listener?.port {
                        print("NearDrop advertising on port: \(port)")
                    }
                case .failed(let error):
                    print("NearDrop listener failed: \(error)")
                default:
                    break
                }
            }
            
            listener?.newConnectionHandler = { [weak self] connection in
                self?.handleIncomingConnection(connection)
            }
            
            listener?.start(queue: .main)
            resolve(deviceName)
        } catch {
            reject("ADVERTISING_FAILED", error.localizedDescription, error)
        }
    }
    
    @objc
    func stopAdvertising(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        listener?.cancel()
        listener = nil
        resolve(nil)
    }
    
    @objc
    func startDiscovery(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
        let parameters = NWParameters()
        parameters.includePeerToPeer = true
        
        // Browse for NearDrop services
        let descriptor = NWBrowser.Descriptor.bonjour(type: "_googlercast._tcp", domain: nil)
        browser = NWBrowser(for: descriptor, using: parameters)
        
        browser?.stateUpdateHandler = { state in
            switch state {
            case .ready:
                print("NearDrop browser ready")
            case .failed(let error):
                print("NearDrop browser failed: \(error)")
            default:
                break
            }
        }
        
        browser?.browseResultsChangedHandler = { [weak self] results, changes in
            for result in results {
                if case let .service(name, type, domain, interface) = result.endpoint {
                    self?.sendEvent("onNearDropDeviceFound", body: [
                        "name": name,
                        "type": type,
                        "domain": domain ?? ""
                    ])
                }
            }
        }
        
        browser?.start(queue: .main)
        resolve(nil)
    }
    
    @objc
    func stopDiscovery(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        browser?.cancel()
        browser = nil
        resolve(nil)
    }
    
    @objc
    func connect(_ endpoint: String,
                resolver resolve: @escaping RCTPromiseResolveBlock,
                rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Convert endpoint string to NWEndpoint
        // This would need proper parsing in production
        resolve(endpoint)
    }
    
    @objc
    func sendFile(_ endpointId: String,
                 fileUri: String,
                 fileName: String,
                 resolver resolve: @escaping RCTPromiseResolveBlock,
                 rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let fileURL = URL(string: fileUri) else {
            reject("INVALID_URI", "Invalid file URI", nil)
            return
        }
        
        // Read file data
        do {
            let fileData = try Data(contentsOf: fileURL)
            
            // Send via HTTP POST (NearDrop protocol)
            sendViaHTTP(endpoint: endpointId, fileName: fileName, fileData: fileData) { success, error in
                if success {
                    resolve(fileName)
                } else {
                    reject("SEND_FAILED", error ?? "Unknown error", nil)
                }
            }
        } catch {
            reject("FILE_READ_ERROR", error.localizedDescription, error)
        }
    }
    
    private func handleIncomingConnection(_ connection: NWConnection) {
        connection.start(queue: .main)
        
        connection.receiveMessage { [weak self] data, context, isComplete, error in
            if let data = data {
                self?.handleReceivedData(data, from: connection)
            }
        }
    }
    
    private func handleReceivedData(_ data: Data, from connection: NWConnection) {
        // Parse HTTP request and extract file
        // Emit event to React Native
        sendEvent("onNearDropFileReceived", body: [
            "size": data.count
        ])
    }
    
    private func sendViaHTTP(endpoint: String, fileName: String, fileData: Data, completion: @escaping (Bool, String?) -> Void) {
        // Create HTTP POST request
        guard let url = URL(string: "http://\(endpoint)/api/send") else {
            completion(false, "Invalid endpoint URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
        request.setValue(fileName, forHTTPHeaderField: "X-File-Name")
        request.httpBody = fileData
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(false, error.localizedDescription)
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                completion(true, nil)
            } else {
                completion(false, "HTTP request failed")
            }
        }
        
        task.resume()
    }
    
    private func sendEvent(_ eventName: String, body: [String: Any]) {
        sendEvent(withName: eventName, body: body)
    }
}
