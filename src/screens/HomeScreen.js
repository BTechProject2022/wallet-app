import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import walletAPI from "./../api/walletAPI"
import AsyncStorage from '@react-native-async-storage/async-storage';
import visit from './../utils/ObjectIterator'
// import secp256k1 from 'react-native-secp256k1';
// import * as secp from "noble-secp256k1";
// import { RSA } from 'react-native-rsa-native';
// import keypair from 'keypair';
// import * as secp from "@noble/secp256k1";
// import crypto from 'crypto';
// import * as secp256k1 from '@transmute/did-key-secp256k1';

const HomeScreen = ({navigation}) => {

  // Generate Public Private Key/ETHEREUM Adderss
    // const ethereum_Address="0x7eac666Ee06209D82e89094d58C589dBfB95f3F4"
    // const public_key = "0x9c5b5a524d451d7daaef278d04228d21d1cadc7ecac8a0773f82b24ee843c7414216deaf2811674d50f31c4f8c44b30997a850eb0043793df6eb1bffea3c679"
    const [key,setKey] = useState({});
    const [did,setDid] = useState("");
    const [DID_Document,setDID_Document] = useState({});
    const [isBiometricSupported, setIsBiometricSupported] = React.useState(false);

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
            // console.log(key);
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
                // console.log(responseKey.data);

                const resp = await walletAPI.post("/createDID",{
                  address: responseKey.data.Address,
                  publicKey : responseKey.data.PublicKey,
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
          // console.log(res);
          // var result= visit(res,null);
          // Alert.alert(
          //   "Your DID Document is",
          //   result,
          //   [
          //     { text: "OK", onPress: () => console.log("OK Pressed") }
          //   ]
          // );
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

  // console.log(props)
  return (
    <View> 
      {isEmptyObject(key) ? 
        <Button 
        title="Create DID"
        onPress={()=> {createDid()}}
        />
        : null
      }
    { !isEmptyObject(key) ? 
      <Button 
      title="View DID Document"
      onPress={()=> {getDidDocument()}}
      />
      : null
    }
      <Button 
      title="Go to QR Code Screen"
      onPress={()=> {navigation.navigate("Issuer")}}
      />
      <Button 
      title="Clear Data"
      onPress={()=> {AsyncStorage.clear()}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
  },
});

export default HomeScreen;

