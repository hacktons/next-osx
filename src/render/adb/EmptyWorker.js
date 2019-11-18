class EmptyWorker {
    postMessage(e) {
        const params = e;
        if (params.terminate)  {
            this.onmessage({data:{}});
        }
    }
    onmessage(e) {

    }
    terminate(){

    }
}
export default EmptyWorker;