import React, {useState,useEffect} from 'react';
import { Text, StyleSheet,Button, View, TouchableOpacity,Alert,ScrollView } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import walletAPI from "./../api/walletAPI"
import AsyncStorage from '@react-native-async-storage/async-storage';
import visit from './../utils/ObjectIterator'
import * as CryptoJS  from 'crypto-js';
import { Avatar, Card, Title, Paragraph } from 'react-native-paper';
import Dialog from "react-native-dialog";

// const DEFAULT_IMAGE = Image.resolveAssetSource(DefaultImage).uri;

const HomeScreen = ({navigation}) => {

  // Generate Public Private Key/ETHEREUM Adderss
    // const ethereum_Address="0x7eac666Ee06209D82e89094d58C589dBfB95f3F4"
    // const public_key = "0x9c5b5a524d451d7daaef278d04228d21d1cadc7ecac8a0773f82b24ee843c7414216deaf2811674d50f31c4f8c44b30997a850eb0043793df6eb1bffea3c679"
    const [key,setKey] = useState({});
    const [did,setDid] = useState("");
    const [DID_Document,setDID_Document] = useState({});
    const [isBiometricSupported, setIsBiometricSupported] = React.useState(false);
    const [visibleGetDidDialog, setVisibleGetDidDialog] = useState(false);
    const [visibleExportDialog, setVisibleExportDialog] = useState(false);
    const [name, setName] = useState("");
    const [visibleRestoreDidDialog, setVisibleRestoreDidDialog] = useState(false);
    const [restoreAccount, setRestoreAccount] = useState([]);
    const [exportPassword, setExportPassword] = useState([]);

    useEffect(() => {


      (async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);

        // const key =await RSA.generateKeys(256);
        // const pair = keypair();
        // console.log(pair);
      })();

      AsyncStorage.getItem('DID').then((res)=>{
        if(res){
          // console.log("HERe"+did);
          setDid(res);
          AsyncStorage.getItem('Keys').then((keyResult)=>{
            const jsonValue = JSON.parse(keyResult);
            setKey(jsonValue);
            // console.log(jsonValue);
          });
        }

        AsyncStorage.getItem('DID_Document').then((res)=>{
          if(res){
            // console.log("HERe"+did);
            setDID_Document( JSON.parse(res));
          }
        });

      });

    },[]);

    const exportData =async () => {

      if(exportPassword[0]!== exportPassword[1]){
        Alert.alert("Password DO NOT MATCH");
        return;
      }


      // KEYS
      const keysString =await AsyncStorage.getItem('Keys');
      const keys = keysString != null ? JSON.parse(keysString) : null

      // NAME
      const name =await AsyncStorage.getItem('Name');

      // NAME
      const did =await AsyncStorage.getItem('DID');

      // DID Document
      const didDocumentString = await AsyncStorage.getItem('DID_Document')
      const didDocument = didDocumentString != null ? JSON.parse(didDocumentString) : null

      // ISSUER
      const issuerString = await AsyncStorage.getItem('Credentials')
      const issuer = issuerString != null ? JSON.parse(issuerString) : null
      
      // VERIFIER
      const verifierString = await AsyncStorage.getItem('ShareHistory')
      const verifier = verifierString != null ? JSON.parse(verifierString) : null


        // console.log(exportPassword);
      const data = {
        "keys": keys,
        "name":name,
        "did":did,
        "did_document":didDocument,
        "issued": issuer,
        "shared": verifier,
      }

      
      // Encrypt
      const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), exportPassword[0]).toString();
      // console.log(ciphertext);
      // Decrypt
      // const resp = await walletAPI.get(`/exportAccount/`);
      const resp = await walletAPI.post("/exportAccount",{
        did: did,
        data : ciphertext,
      });

      if(resp.status==200){
        Alert.alert("Account successfully Backedup");
        // setVisibleGetDidDialog(false);
        setExportPassword(["",""]);
        setVisibleExportDialog(false);
        var decryptedData="";
        try {
          const respData = await walletAPI.get(`/importAccount/${did}`);
          const value = respData.data.data;
          // console.log(value);
          const bytes  = CryptoJS.AES.decrypt(value, exportPassword[1]);

          decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        }catch(e){
          console.log(e);
        }
        
        
  
        console.log(decryptedData); 

      }else{
        Alert.alert("Error backing up account");
      }

      // [{id: 1}, {id: 2}]
    }

    const createDid =async () => {
        // API CALL HERE to Create DID

        if(!name ||name ===""){
          Alert.alert(
            'Please enter a Name',
          );
          return;
        }
        const LocalAuthenticationOptions = {
          promptMessage: "Confirm your identity",
          // disableDeviceFallback : true
        }
         LocalAuthentication.authenticateAsync(LocalAuthenticationOptions).then(async result=>{
            if(result.success){
            
              try {

                const responseKey = await walletAPI.get(`/keyPair`);
                const jsonValue = JSON.stringify(responseKey.data);
                await AsyncStorage.setItem('Keys', jsonValue);
                await AsyncStorage.setItem('Name', name);      
                // console.log(responseKey.data);

                const resp = await walletAPI.post("/createDID",{
                  address: responseKey.data.Address,
                  publicKey : responseKey.data.PublicKey,
                  name: name,
                });
                // console.log(resp.data.did);
                // Call API TO CREATE THE DID
                await AsyncStorage.setItem('DID', (resp.data.did));

                const respDID_Doc = await walletAPI.get(`/getDIDDoc/${resp.data.did}`);
                const value = respDID_Doc.data;
                // console.log(resp.data);
                // store the result in the async storage
                const jsonValueDID_Doc = JSON.stringify(value)
                await AsyncStorage.setItem('DID_Document', jsonValueDID_Doc)
                // alert(resp.data.did);
                Alert.alert(
                  "Your DID is",
                  resp.data.did,
                  [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                  ]
                );
                setDid(resp.data.did);
                setKey(responseKey.data);
                setDID_Document( jsonValueDID_Doc); 
                
              }catch(e){
                console.log(e);
              }
  
              // STORE RESULT IN ASYNC STORAGE
              // try {
                  
              //     // const jsonValue = JSON.stringify(value)
              //     // await AsyncStorage.setItem('@storage_Key', jsonValue)
              // } catch (e) {
              //     console.log(e);
              // }
              

            }else{
              Alert.alert(
                'Biometric record not found',
              );
            }
        })
        setVisibleGetDidDialog(false);

        // did= "some value";
    }

    const getDidDocument =async () => {

      if(!isEmptyObject(DID_Document)){
        // console.log(DID_Document);
        // var result= visit(DID_Document,null);
        // alert(result);
        // Alert.alert(
        //   "Your DID Document is",
        //   result,
        //   [
        //     { text: "OK", onPress: () => console.log("OK Pressed") }
        //   ]
        // );
        navigation.navigate("DIDDisplay",{ type:"DID_Document", id:0 })
        return;
      }

      AsyncStorage.getItem('DID_Document').then(async (res)=>{
        if(res){
          setDID_Document( JSON.parse(res));
          navigation.navigate("DIDDisplay",{ type:"DID_Document", id:0 })

        } else {
          // console.log("HERE");
          // API CALL HERE to get DID Document if not present in storage
          const resp = await walletAPI.get(`/getDIDDoc/${did}`);
          const value = resp.data;
          // console.log(resp.data);
          // store the result in the async storage
          const jsonValue = JSON.stringify(value)
          await AsyncStorage.setItem('DID_Document', jsonValue)
          setDID_Document( value); 
          // var result= visit(value,null);
          // console.log("Result="+result);
          // console.log(result);
          // Alert.alert(
          //   "Your DID Document is",
          //   result,
          //   [
          //     { text: "OK", onPress: () => console.log("OK Pressed") }
          //   ]
          // );
          // console.log("HERe");
          navigation.navigate("DIDDisplay",{ type:"DID_Document", id:0 })
        }
      }).catch(e=>{
        console.log(e);
      })

  }

  const handleRestoreAccount =async ()=>{
      if(restoreAccount[0]==="" || !restoreAccount[0]){
        Alert.alert("Please enter a did");
        return;
      }

      if(restoreAccount[1]==="" || !restoreAccount[1]){
        Alert.alert("Please enter a password");
        return;
      }

      var decryptedData="";
      try {
          const respData = await walletAPI.get(`/importAccount/${restoreAccount[0]}`);
          const value = respData.data.data;
          // console.log(value);
          const bytes  = CryptoJS.AES.decrypt(value, restoreAccount[1]);

          decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }catch(e){
          if(e.message==="Malformed UTF-8 data"){
            Alert.alert("Incorrect Password")
            // console.log("HERE");
          }
          console.log(e.message);
      }

      console.log(decryptedData);

      const keyStringValue = JSON.stringify(decryptedData.keys);
      await AsyncStorage.setItem('Keys', keyStringValue);
      await AsyncStorage.setItem('Name', decryptedData.name);      
      await AsyncStorage.setItem('DID', decryptedData.did);

      const didDocStringValue = JSON.stringify(decryptedData.did_document);
      await AsyncStorage.setItem('DID_Document', didDocStringValue);

      // ISSUER
      const issuerString = JSON.stringify(decryptedData.issued);
      if(issuerString!=="" || !issuerString){
        await AsyncStorage.setItem('Credentials',issuerString)
      }
            
      // VERIFIER
      const verifierString = JSON.stringify(decryptedData.issued);
      if(verifierString!=="" || !verifierString){
        await AsyncStorage.setItem('ShareHistory',verifierString)
      }

      setKey(decryptedData.keys);
      setDid(decryptedData.did);
      setDID_Document(decryptedData.did_document);
      setVisibleRestoreDidDialog(false);
      setRestoreAccount(["",""]);
      Alert.alert("Account Successfuly Restored");

  }

  const toggleRestoreBackup =()=>{
    setVisibleRestoreDidDialog(true);
  }

  const handleRestoreCancel = ()=>{
    setRestoreAccount(["",""]);
    setVisibleRestoreDidDialog(false);
  }
    
  const isEmptyObject= (obj)=> {
    return JSON.stringify(obj) === '{}';
  }

  const handleCancel = () => {
    setVisibleGetDidDialog(false);
  };

  const handleExportDialogCancel = () => {
    setExportPassword(["",""]);
    setVisibleExportDialog(false);
  };

  const handleCreateDid = ()=>{
    setVisibleGetDidDialog(true);
  }

  const handleExport = ()=>{
    // console.log("HERE");
    setVisibleExportDialog(true);
    // console.log(visibleExportDialog);
  }

  // console.log(props)
  return (
    <ScrollView> 

      <Dialog.Container visible={visibleExportDialog} onBackdropPress={handleExportDialogCancel}>
            <Dialog.Title>Export Data</Dialog.Title>
            <Dialog.Description>
              Please enter the password to encrypt your data with
              {'\n'}
            </Dialog.Description>
            <Dialog.Input 
              placeholder="Password" 
              autoCapitalize="none"
              autoCorrect={false}
              value={exportPassword[0]}
              secureTextEntry={true}
              onChangeText= {newTerm => setExportPassword([newTerm,exportPassword[1]])}
            />
             <Dialog.Input 
              placeholder="Confirm Password" 
              autoCapitalize="none"
              autoCorrect={false}
              value={exportPassword[1]}
              secureTextEntry={true}
              onChangeText= {newTerm => setExportPassword([exportPassword[0],newTerm])}
            />
            <Dialog.Button label="Cancel" onPress={handleExportDialogCancel} />
            <Dialog.Button label="Submit" onPress={exportData} />
        </Dialog.Container>

      <Dialog.Container visible={visibleGetDidDialog} onBackdropPress={handleCancel}>
            <Dialog.Title>Create DID</Dialog.Title>
            <Dialog.Description>
              Please enter your name in order to create a DID
              {'\n'}
            </Dialog.Description>
            <Dialog.Input 
              placeholder="Full Name" 
              autoCapitalize="none"
              autoCorrect={false}
              value={name}
              onChangeText= {newTerm => setName(newTerm)}
            />
            <Dialog.Button label="Cancel" onPress={handleCancel} />
            <Dialog.Button label="Submit" onPress={createDid} />
        </Dialog.Container>


        <Dialog.Container visible={visibleRestoreDidDialog} onBackdropPress={handleRestoreCancel}>
            <Dialog.Title>Restore Account</Dialog.Title>
            <Dialog.Description>
              Please enter your did and password to restore your account
              {'\n'}
            </Dialog.Description>
            <Dialog.Input 
              placeholder="DID" 
              autoCapitalize="none"
              autoCorrect={false}
              value={restoreAccount[0]}
              onChangeText= {newTerm => setRestoreAccount([newTerm,restoreAccount[1]])}
            />
            <Dialog.Input 
              placeholder="Password" 
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              value={restoreAccount[1]}
              onChangeText= {newTerm => setRestoreAccount([restoreAccount[0],newTerm])}
            />
            <Dialog.Button label="Cancel" onPress={handleRestoreCancel} />
            <Dialog.Button label="Submit" onPress={handleRestoreAccount} />
        </Dialog.Container>
        
      {isEmptyObject(key) ? 
        // <Button 
        // title="Create DID"
        // onPress={()=> {createDid()}}
        // />
        <View>
        <Card style={styles.cardStyle} onPress={()=> {handleCreateDid()}}>
        <Card.Cover style={styles.imageStyle}  source={require('./../../assets/cards/didIssue.png') } />
        <Card.Content>
          <Title>Get Did</Title>
          <Paragraph>Issue a did and did document for youself which will help you identity yourself to others</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.cardStyle} onPress={()=> {toggleRestoreBackup()}}>
        <Card.Cover style={styles.imageStyle}  source={require('./../../assets/cards/backup.png') } />
        <Card.Content>
          <Title>Restore Account</Title>
          <Paragraph>Restore the previously backed up data including did and credentials on your phone</Paragraph>
        </Card.Content>
      </Card>
      </View>
        : null
      }
    { !isEmptyObject(key) ? 
      // <Button 
      // title="View DID Document"
      // onPress={()=> {getDidDocument()}}
      // />
      <View>
      <Card style={styles.cardStyle} onPress={()=> {getDidDocument()}}>
        <Card.Cover style={styles.imageStyle}  source={require('./../../assets/cards/did.png') } />
        <Card.Content>
          <Title>View Did Document</Title>
          <Paragraph>A set of data that describes a Decentralized Identifier i.e. you</Paragraph>
        </Card.Content>
      </Card>
      
    
      {/* <Button 
      title="Issue Credential"
      onPress={()=> {navigation.navigate("Issuer")}}
      /> */}
        <Card style={styles.cardStyle} onPress={()=> {navigation.navigate("Issuer")}} mode='outlined'>
          <Card.Cover style={styles.imageStyle}  source={require('./../../assets/cards/issuer.png') } />
          <Card.Content>
            <Title>Get Credential</Title>
            <Paragraph>Get credentials from Issuer by scanning the QR code from the Isser's website</Paragraph>
          </Card.Content>
        </Card>
        {/* <Button 
        title="Send Credential"
        onPress={()=> {navigation.navigate("Verifier")}}
        /> */}
        <Card style={styles.cardStyle} onPress={()=> {navigation.navigate("Verifier")}}>
          <Card.Cover style={styles.imageStyle}  source={require('./../../assets/cards/verifier.png') } />
          <Card.Content>
            <Title>Send Credential</Title>
            <Paragraph>Send credetial to the verifier by scanning the QR code present on the Verifier website and selecting the credential you want to share</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.cardStyle} onPress={()=> {handleExport()}}>
        <Card.Cover style={styles.imageStyle}  source={require('./../../assets/cards/backup.png') } />
        <Card.Content>
          <Title>Export Data</Title>
          <Paragraph>Export the latest copy your password encrypted data onto the blockchain so that you can restore the data in a new device</Paragraph>
        </Card.Content>
        </Card>
      </View>
      : null
    }
      <Button 
      title="Clear Data"
      onPress={()=> {AsyncStorage.clear()}}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
  },
  cardStyle:{
    margin: 10,
    borderColor: 'black',
    borderWidth: 1.5,
  },
  imageStyle:{
    width: null,
    resizeMode: 'contain',
    height: 150
  }
});

export default HomeScreen;

