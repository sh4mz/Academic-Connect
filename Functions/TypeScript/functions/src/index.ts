import * as functions from 'firebase-functions';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as HttpStatus from 'http-status-codes';
import * as Firestoree from '@google-cloud/firestore';


enum UserType { STUDENT = "STUDENT", TEACHER = "TEACHER", PARENT = "PARENT", UNKNOWN = "UNKNOWN", }
interface IUserRequest extends express.Request {
    user: any
}

admin.initializeApp(functions.config().firebase);

const app = express();
// const loginCredentialsCheck = express();

const db = admin.firestore();

exports.webApi = functions.https.onRequest(app);
// exports.loginApi = functions.https.onRequest(loginCredentialsCheck);

//To Check if user is authenticated or not
// @ts-ignore
const validateFirebaseIdToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized');
        return;
    }

    var idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        console.log('ID Token correctly decoded', decodedIdToken);
        console.log('ID Token correctly decoded: Email', decodedIdToken.email);
        var requestWrapper: IUserRequest = <IUserRequest>req;
        requestWrapper.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized');
        return;
    }
};

app.post('/profileupdate', async (req: express.Request, res: express.Response) => {
    try {
        console.log("code"+req.body.schoolCode);
        console.log('In Try');
        const {
            schoolCode,
            profileData,
            userType,
            country } = req.body;

        const data = {
            schoolCode,
            profileData,
            userType,
            country
        }
        console.log('Here');

        console.log(data.country);
        console.log(data.userType);
        console.log(data.country);

        const profileDataMap = data.profileData as Map<String, any>;
        const id = data.profileData.id;
        console.log(id);

        const ref = await getProfileRef(data.schoolCode, data.country, data.userType, id);
        ref.set(profileDataMap, { merge: true });

        res.status(HttpStatus.OK).send("Profile Updated " + HttpStatus.getStatusText(HttpStatus.OK));

    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR));
    }
});

function _getSchoolRef(schoolCode: string, country: string): Firestoree.CollectionReference {
    return db.collection('Schools').doc(country).collection(schoolCode);
}

async function getProfileRef(schoolCode: string, country: string, userType: string, id: string): Promise<Firestoree.DocumentReference> {
    const _profileRef = _getSchoolRef(schoolCode, country).doc('Profile');
    let res: Firestoree.DocumentReference;
    if (userType == UserType.STUDENT) {
        res = await _profileRef.collection('Student').doc(id);
    } else
        if (userType == UserType.TEACHER) {
            res = await _profileRef.collection('Teachers').doc(id);
        } else
            if (userType == UserType.PARENT) {
                res = await _profileRef.collection('Parents').doc(id);
            } else {
                res = await _profileRef.collection('Unknown').doc(id);
            }
    return res;
}

