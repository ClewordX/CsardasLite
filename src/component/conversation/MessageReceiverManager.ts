
export class ConversationMessageReceiverManager {
    private static _currentMessageReceiver: HTMLIFrameElement;
    public static get currentMessageReceiver() { return ConversationMessageReceiverManager._currentMessageReceiver; }
    public static registerCurrentMessageReceiver(x: HTMLIFrameElement) {
        ConversationMessageReceiverManager._currentMessageReceiver = x;
        let z = () => {
            while (ConversationMessageReceiverManager._messageQueue.length > 0) {
                console.log(`sending queue `);
                ConversationMessageReceiverManager.sendMessage(ConversationMessageReceiverManager._messageQueue.shift(), '*');
            }
            x.removeEventListener('load', z);
        }
        x.addEventListener('load', z);
    }

    private static _messageQueue: any[] = [];
    public static sendMessage(x: any) {
        console.log(`smsg`, x);
        if (!ConversationMessageReceiverManager._currentMessageReceiver) {
            this._messageQueue.push(x);
        } else {
            ConversationMessageReceiverManager._currentMessageReceiver.contentWindow.postMessage({
                protocol: 'csardas',
                data: x
            }, '*');
        }
    }
}

(window as any).M = ConversationMessageReceiverManager;
