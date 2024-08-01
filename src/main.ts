// Import Styles
import './assets/main.css'

// Import Vue
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Amplify
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Initalize Amplify
Amplify.configure(outputs);

// Create Vue App
const app = createApp(App)
app.use(router)
app.mount('#app')
