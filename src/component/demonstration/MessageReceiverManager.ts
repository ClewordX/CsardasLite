
export class ConversationMessageReceiverManager {
    private static _currentMessageReceiver: HTMLIFrameElement;
    public static get currentMessageReceiver() { return ConversationMessageReceiverManager._currentMessageReceiver; }
    public static registerCurrentMessageReceiver(x: HTMLIFrameElement) {
        ConversationMessageReceiverManager._currentMessageReceiver = x;
        while (ConversationMessageReceiverManager._messageQueue.length > 0) {
            x.contentWindow.postMessage(ConversationMessageReceiverManager._messageQueue.shift(), '*');
        }
    }

    private static _messageQueue: any[] = [];
    public static sendMessage(x: any) {
        if (!ConversationMessageReceiverManager._currentMessageReceiver) {
            this._messageQueue.push();
        } else {
            ConversationMessageReceiverManager._currentMessageReceiver.contentWindow.postMessage(x, '*');
        }
    }
}

