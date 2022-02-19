import walletAPI from "./../api/walletAPI"
import sha256 from 'crypto-js/sha256';
import AsyncStorage from '@react-native-async-storage/async-storage';


const getCredential= async (did,userDid)=>{

    let credential;
    try {
        const hash =  sha256("userDid").toString();
        // console.log("Hash="+hash);
        const keys = await AsyncStorage.getItem('Keys');
        const keysObj=JSON.parse(keys);
        // console.log("Private Key="+keysObj.PrivateKey);
        const resp = await walletAPI.post("/sign",{
            hash: hash,
            privateKey: keysObj.PrivateKey,
        });
        // console.log(resp.data);
        const response =  await walletAPI.post("/getCredential",{
            credDID: did,
            ownerDID: userDid,
            hash: hash,
            sign: resp.data.sign
        });
        // console.log(response.data);
        credential= response.data;

    }catch(error){
        console.log(error);
    }

    return credential;
}

export default getCredential;