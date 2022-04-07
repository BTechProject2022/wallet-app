import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import store from 'react-native-simple-store';
import walletAPI from "./../api/walletAPI"
import getCredential from "./../utils/GetCredential"
import { off } from 'process';

export default function QRScannerScreen({navigation}) {

//   console.log(navigation.state.params);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [userDid, setUserDid] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');

    //   await AsyncStorage.removeItem('Credentials')

    })();



  }, []);

  const handleBarCodeScanned =async ({ type, data }) => {
    setScanned(true);
    // console.log("HERE");

    if(navigation.state.params.type==='issuer'){
      const credential =await callApiForCredentail(JSON.parse(data));
      // console.log(credential);
      setObjectValue(credential).then(()=>{
          // console.log("doNE")
          navigation.state.params.setScanned(navigation.state.params.scanned+1);
          navigation.navigate("Issuer");
      })

    }else if(navigation.state.params.type==='verifier'){

      

      const did =await getUserDID();
      const QRData = JSON.parse(data);

      navigation.navigate("DocSelect",{ QRData:QRData, did:did, setScanned:navigation.state.params.setScanned, scanned:navigation.state.params.scanned});
      // const apiEndPoint = QRData.apiLink;
      // const response = await fetch(apiEndPoint, {
      //   method: 'POST',
      //   headers: {
      //     Accept: 'application/json',
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     userDid: did,
      //     userId: QRData.uid,
      //     recieverDid: QRData.recieverDid,
      //     documentDid: selectedDocumentDid,
      //     hash: documentHash,
      //     sign:documentSign
      //   })
      // });
      // const json = await response.json();


      // console.log("HERE");
    }
    
    
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const getUserDID = async ()=>{

    if(userDid!==""){
      return userDid;
    }

    return AsyncStorage.getItem('DID').then((res)=>{
      if(res){
        setUserDid(res);
        return res;
      }
      return null;
    });
    
  }

  const callApiForCredentail  =async (QRData)=>{
    const did =await getUserDID();
    // console.log(QRData);
     const apiEndPoint = QRData.url;
     const studentId= QRData.studentId;
     const schemaDid= QRData.schemaDid;
     try{
        const response = await fetch(apiEndPoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userDid: did,
            studentId: studentId,
            schemaDid: schemaDid
          })
        });

        // if(QRData.type==='Image'){

        //   // Handle IMAGES HERE


        // }else{
          const json = await response.json();
          // console.log(json);
          const credential =await getCredential(json.credentialDid,did);
          const issuerDID =  await walletAPI.get(`/getDIDDoc/${credential.issuerDID}`,);
          // console.log(response.data);
          const issuerName = (issuerDID.data.name);
          // const credential =await getCredential("did:cred:a91cbd9ac28ed4f6da798057695954732d0b33ff",did);
          // credential.hash = "did:cred:a91cbd9ac28ed4f6da798057695954732d0b33ff";
          credential.hash = json.credentialDid;
          credential.issuerName = issuerName;
          return credential;
        // }

        
    }catch(error){
      console.log(error);
    }
   
  }


  const getCredentialsObject = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('Credentials')
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch(e) {
        console.log(e);
    }
   
  }

  // const getSchemaObject = async () => {
  //   try {
  //     const jsonValue = await AsyncStorage.getItem('Schemas')
  //     return jsonValue != null ? JSON.parse(jsonValue) : null
  //   } catch(e) {
  //       console.log(e);
  //   }
   
  // }

  const checkCredential = (credential,curr_credentials) => {
    //   if(credential.id==null || credential.title==null || credential.subtitle==null){
      // console.log(credential);
    if(credential.hash==null){
            alert(`Invalid Credential`);
            navigation.navigate("Issuer");
            return false;
      }else{
            if(curr_credentials){
                for (var i = 0; i < curr_credentials.credentials.length; ++i) {
                // curr_credentials.credentials.forEach(element => {
                    if(curr_credentials.credentials[i].hash==credential.hash){
                        alert(`Credential ${credential.type} already exists`);
                        // navigation.navigate("Issuer");
                        // console.log("IN FOR LOOP");
                        return false;
                    }
                }
                return true;
            }else{
                return true;
            }
      }
  }

  const setObjectValue = async (data) => {
    // const temp = JSON.parse(data);
    // const responseSchema = await walletAPI.get(`/getSchema/${temp.id}`);

    // console.log(responseSchema.data);
    try {

      var curr_credentials =await getCredentialsObject();
    //   console.log(curr_credentials);
      const temp = (data);
      // console.log(data);
      const value = {
        hash: temp.hash,
        type : temp.type[1],
        issuanceDate: temp.issuanceDate,
        issuerName: temp.issuerName,
      }
      if(!checkCredential(value,curr_credentials)){
        // console.log("HERE1");
        // navigation.navigate("Issuer");
        return;
      }else{
    //   console.log(value);
        // console.log("HERE2");
        if(curr_credentials){
            // const jsonValue = JSON.stringify(value);
            curr_credentials.credentials.push(value);
            const jsonValue = JSON.stringify(curr_credentials);
            await AsyncStorage.setItem('Credentials', jsonValue);
            // await AsyncStorage.setItem('TEMP', "SOME TEMP");
            // const temp =await AsyncStorage.getItem('TEMP');
            // var curr_schema =await getSchemaObject();
            // curr_schema.schemas.push(responseSchema.data);
            // const jsonValue2 = JSON.stringify(curr_schema);
            // await AsyncStorage.setItem('Credentials', jsonValue2);

        }else{
            // Save Credential
            const curr_credentialsNew= {
                credentials : []
            };
            curr_credentialsNew.credentials.push(value);
            const jsonValue = JSON.stringify(curr_credentialsNew);
            await AsyncStorage.setItem('Credentials', jsonValue);
            // const temp =await getCredentialsObject();

            // Save Schema
            // const curr_schemaNew= {
            //   schemas : []
            // };
            // curr_schemaNew.schemas.push(responseSchema.data);
            // const jsonValue2 = JSON.stringify(curr_schemaNew);
            // await AsyncStorage.setItem('Schemas', jsonValue2);
            // const temp =await getCredentialsObject();
        }  
        } 
    } catch(e) {
        console.log(e);
        }  
    // console.log('Done.')
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {/* {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});