import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.4/firebase-auth.js';
import * as Elements from '../viewpage/elements.js'
import * as Util from '../viewpage/util.js'
import * as Constants from '../model/constants.js'
import { routing } from './route.js';
import * as WelcomeMessage from '../viewpage/welcome_message.js';

const auth = getAuth();

export let currentUser = null;

export function addEventListeners() {
    Elements.formSignIn.addEventListener('submit', async e => {
        e.preventDefault();//keeps from refreshing current page
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user;
            Elements.modalSignin.hide();
            console.log('sign in success:${user}')
        }
        catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            Util.info('Sign In Error', JSON.stringify(error), Elements.modalSignin);
            if (Constants.DEV)
                console.log('sign in error:${errorCode} | ${errorMessage}')
        }

    });

    Elements.menuSignOut.addEventListener('click', async () => {
        //sign out from Firebase Auth
        try {
            await signOut(auth);
            //console.log('sign out success');
        } catch (e) {
            Util.info('sign out error', JSON.stringify(e));
            if (Constants.DEV)
                console.log('sign out error' + e);

        }
    });
    onAuthStateChanged(auth, AuthStateChangedObserver);
}

function AuthStateChangedObserver(user) {
    if (user) {
        currentUser = user;
        let elements = document.getElementsByClassName('modal-preauth');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'none';
        }
        elements = document.getElementsByClassName('modal-postauth'); {
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = 'block';
            }
        }
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        routing(pathname, hash);
        //console.log('auth state changed: $(user.email)');
    }
    else {
        currentUser = null;
        let elements = document.getElementsByClassName('modal-preauth');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'block';
        }
        elements = document.getElementsByClassName('modal-postauth'); {
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = 'none';
            }
        }
        Elements.root.innerHTML = WelcomeMessage.html;
        //Elements.root.innerHTML = 'Signed Out';
        //console.log('auth state changed: Signed out');
    }
}

