import { toast } from '@zerodevx/svelte-toast';
import Toast from '$lib/Toast.svelte';

function sendToast(color, message) {
    return toast.push({
        target: 'default',
        component: {
            src: Toast,
            props: { message, color },
            sendIdTo: 'toastId'
        },
    });
};

const toasts = {
    success: (message) => { return sendToast('#39db7f', message); },
    warning: (message) => { return sendToast('#FFC500', message); },
    danger: (message) => { return sendToast('#D81A1A', message); },
    info: (message) => { return sendToast('#3b82f6', message); },
    remove: (id) => toast.pop(id),
};
export default toasts;