let vueApp = new Vue({
    el: "#vueApp",
    computed: {
        ws_address: function() {
            return `${this.rosbridge_address}`
        },
    },
    data: {
        // ros connection
        connected: false,
        ros: null,
        logs: [],
        loading: false,
        rosbridge_address: 'wss://i-00cbdc40fcccd3514.robotigniteacademy.com/7e4d6577-22bd-40b2-b93e-1dab1f84d000/rosbridge/', 
        port: '9090',
        // page content
        menu_title: 'Connection',
        // publisher
        pubInterval: null
    },
    methods: {
        connect: function() {
            // define ROSBridge connection object
            this.loading = true
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address
            })
            // define callbacks
            this.ros.on('connection', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Connected!')
                this.connected = true
                this.loading = false
                console.log('Connection to ROSBridge established!')
                // Camera
                this.setCamera()
            })
            this.ros.on('error', (error) => {
                this.logs.unshift((new Date()).toTimeString() + ` - Error: ${error}`)
            })
            this.ros.on('close', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Disconnected!')
                this.connected = false
                this.loading = false
                console.log('Connection to ROSBridge was closed!')
                clearInterval(this.pubInterval)
                document.getElementById('robotCamera').innerHTML = ''
            })
        },
        publish: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/webpage',
                messageType: 'std_msgs/Int16'
            })
            let message = new ROSLIB.Message({
                data: 1
            })
            topic.publish(message)
        },
        disconnect: function() {
            this.ros.close()
        },
        setCamera: function() {
            let without_wss = this.rosbridge_address.split('wss://')[1]
            console.log(without_wss)
            let domain = without_wss.split('/')[0] + '/' + without_wss.split('/')[1]
            console.log(domain)
            let host = domain + '/cameras'
            let viewer = new MJPEGCANVAS.Viewer({
                divID: 'robotCamera',
                host: host,
                width: 640,
                height: 400,
                topic: '/detected_holes_image',
                ssl: true,})
        },
    },
})