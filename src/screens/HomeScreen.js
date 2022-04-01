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
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState("");


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
        setVisible(false);
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
    
  const isEmptyObject= (obj)=> {
    return JSON.stringify(obj) === '{}';
  }

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreateDid = ()=>{
    setVisible(true);
  }

  // console.log(props)
  return (
    <ScrollView> 
      <Dialog.Container visible={visible} onBackdropPress={handleCancel}>
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
      {isEmptyObject(key) ? 
        // <Button 
        // title="Create DID"
        // onPress={()=> {createDid()}}
        // />
        <Card style={styles.cardStyle} onPress={()=> {handleCreateDid()}}>
        <Card.Cover style={styles.imageStyle}  source={require('./../../assets/cards/didIssue.png') } />
        <Card.Content>
          <Title>Get Did</Title>
          <Paragraph>Issue a did and did document for youself which will help you identity yourself to others</Paragraph>
        </Card.Content>
      </Card>
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

