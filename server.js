const express = require('express');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
require('firebase/auth');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Firebase Client SDK
const firebaseConfig = {
  apiKey: "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0nfWxKyYbVgak\nmngSb8KiMR4pAyfNSd5SrHLX9RVS2Vek3NFjh5QNw6w+Npf7wo0NATRwfX5sygke\nv1CCpdxrOM+RCye0VfTw6L0BFQZmB6Rs1/1VwEtBUwFPBTJOR30MI5g+oTXHEaEz\nGtCQ9+xnuRj459IWa5uaa03ua15gBU2avB9mTWFFxjN5ztAqKEWN9DcCGVO+OwS/\nuMLfVoYo0VFMdyJ+M1kh+J4r/1lrA0s4Z5r+37jGeubWdBS70JOwnUAjbujMHKP1\nwmAkfwn/mYGgw4iBVpn1SoGVTyTV1u6GSjSpqRn7eUfgvjUGz/NXhAZj+DEAfE4b\n4c8C/3N3AgMBAAECggEAECpBBpHHj9PDtXCzxWamQ1DlE6OaKNfvI3QWtThUp70X\nCITQ4rkMKa01Gb5WHOy9JghREq5QpdjxNwTFZmQE1b3YafFXJN86lGMoI1Qn5fLS\nJwGvxUB4G8kbiWB8L6BbUz5OTnCsOPxdco74Urk1udTJpOFOnr4Tx57J80g9wpcg\nXO9UiVBcSTUy5lu54O87FeomLmwrnIF1BuqCyRpZKoYPm0gAWUp9LviVrjAvbhjw\nm/BiAnl0WDVJ1C5pScGEx7PBaJqXPUXrGrrkChVfuZG9Nw6rZD7oQznGM07yO+GD\nRKRy9wwUVh7NWhDlbbaUxlqlURHMtiSpbU6z+/wnaQKBgQDjnFK6L0HdBA2Gp2gP\ndBUNwYz2xiterAvwM/l084nTyFH0u9Rx/r+oXXseBNpTuHKF+AsQumZ5DcnXvtQ+\nMQgiUrE82t59WM73V8WJRUWk2k9cH9emQHNTYtKNfGAoZ1wWFVVne7OPHDqF1yxv\n52GUb28ksp5qbYwzhlsJZtPTfwKBgQDLJR3NrFLfNcNoNZnfYv3wrClFUMxe99G+\ncJObXT/BVLmqaa12zuSZ8WOn95PPXnIDeQNajD/dE5k0kBiVWdfvbQsa5syc8yeZ\nbbz/KE/FhDKFqZqIG7uaGlsV5Zm+1YlwMDMI3UHtJud9rFUw4KtMuzI0IP1YVD9R\nCFnTnKT8CQKBgQDchpQcsjbFNe0I/t+ywUy4xEOYwQ46LsVuWF0ks+VhHSBS1z2R\nqTn2nYPw5NDH9th29ol6Dq/EL9jVQJ4RF56C6s2wYXrZxZbZTOAmDMjaXW4wmuVs\nvds++mt4C/56hxJQjyDtH4wsZzRIgt8aGPuRPppX2vvjr/n73fwMUuV/bwKBgB+5\ntTTYs7yOTe0padV8RUJf8LYVj0VJmKUQOc0qu/k6fSCDDoceeo8cJr8lqBzbmBy4\nunBatOKW2/dchapVdKa8td5Gqy/bvZR1ke2bYxHqumUrfqnBAwRnF1CNIfyupp8x\nt9arj081IzP6RPe0Lqx2E7oWaNpxlc3W6whkT1PZAoGBAKuiDPZ+VSbfwsbSYD1E\nSf5sUX617ZLTmvlHhg+8UHF6jIF6aaA2nMud+kpGiztAMc1zhNqAVSb+IBCVoSgf\ndBzDFlCUNEsauzYXW0mQ6oFeT/2dseTfaRgvQK3zG51Lnd9ZFVUbTFfNlhUqXjij\nmN8Wjb4FPl2qHQGkd4Abh8rO",
  authDomain: "pennypath-faffd.firebaseapp.com",
};
firebase.initializeApp(firebaseConfig);

app.use(cors());
app.use(express.json());

// Register User
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await firebase.auth().createUserWithEmailAndPassword(email, password);
    res.status(201).json({ message: 'User registered successfully', user: user.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login User
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await firebase.auth().signInWithEmailAndPassword(email, password);
    const idToken = await user.user.getIdToken();
    res.json({ message: 'Login successful', token: idToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check Login Status
app.get('/status', async (req, res) => {
  const token = req.headers.authorization;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({ message: 'User is logged in', uid: decodedToken.uid });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Forgot Password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    await firebase.auth().sendPasswordResetEmail(email);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
