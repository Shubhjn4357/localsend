// Fun device name generator
const ADJECTIVES = [
    'Fresh', 'Happy', 'Bright', 'Sunny', 'Cool', 'Swift', 'Smart', 'Noble',
    'Brave', 'Calm', 'Wild', 'Free', 'Bold', 'Warm', 'Kind', 'Quick',
    'Gentle', 'Strong', 'Wise', 'Lucky', 'Clever', 'Jolly', 'Merry', 'Fancy',
];

const NOUNS = [
    'Broccoli', 'Penguin', 'Dolphin', 'Tiger', 'Eagle', 'Lion', 'Phoenix',
    'Dragon', 'Falcon', 'Panda', 'Koala', 'Otter', 'Wolf', 'Fox', 'Bear',
    'Rabbit', 'Owl', 'Hawk', 'Raven', 'Deer', 'Moose', 'Lynx', 'Jaguar', 'Leopard',
];

export function generateRandomDeviceName(): string {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adjective} ${noun}`;
}

export function generateDeviceId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
