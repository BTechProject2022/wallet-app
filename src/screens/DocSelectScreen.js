import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert,FlatList } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import walletAPI from "../api/walletAPI"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
// import QRScanner from './../components/QRScanner'
import visit from '../utils/ObjectIterator'
import getCredential from "./../utils/GetCredential"
import sha256 from 'crypto-js/sha256';

const DocSelectScreen = ({navigation}) => {
    
    // const [hasPermission, setHasPermission] = useState(null);
    const [data, setData] = useState("");
    const [verifiableCredentials,setVerifiableCredentials] = useState([]);
    const [scanned, setScanned] = useState(0);

    // if(verifiableCredentials[0])
    //   console.log(verifiableCredentials[0].id);

    // useEffect(() => {
    //   (async () => {
    //     const { status } = await BarCodeScanner.requestPermissionsAsync();
    //     setHasPermission(status === 'granted');
    //     const LocalAuthenticationOptions = {
    //       promptMessage: "Confirm your identity",
    //       // disableDeviceFallback : true
    //     }
    //      LocalAuthentication.authenticateAsync(LocalAuthenticationOptions).then(async result=>{
    //         if(result.success){
            
    //         }else{
    //           Alert.alert(
    //             'Biometric record not found',
    //           );
    //           navigation.navigate('Home');
    //         }
    //     })
        
    //   })(); 
    // }, []);

    const getCredentialsObject = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('Credentials')
        return jsonValue != null ? JSON.parse(jsonValue) : null
      } catch(e) {
          console.log(e);
      }
     
    }

    useEffect(() => {
      (async () => {
        try {
          const temp =await getCredentialsObject();
          if(temp){
            setVerifiableCredentials(temp.credentials);
          }
        } catch(e) {
          console.log(e);
        }

      })(); 
    },[scanned]);



    const onlistItemPress =async (credential)=>{
      
      // const credential = await getCredential(credential.hash,navigation.state.params.did);
      const QRData = navigation.state.params.QRData;
      const did = navigation.state.params.did;
      const apiEndPoint = QRData.url;
      const hash =  sha256(navigation.state.params.did).toString();
      // console.log("Hash="+hash);
      const keys = await AsyncStorage.getItem('Keys');
      const keysObj=JSON.parse(keys);
      // console.log("Private Key="+keysObj.PrivateKey);
      const resp = await walletAPI.post("/sign",{
          hash: hash,
          privateKey: keysObj.PrivateKey,
      });

      const reqBody = JSON.stringify({
        userDid: did,
        userId: QRData.userId,
        receiverDid: QRData.receiverDid,
        documentDid: credential.hash,
        hash: hash,
        sign: resp.data.sign
      })
      // console.log(apiEndPoint);
      console.log("HEERE");

      const response = await fetch(apiEndPoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: reqBody,
      });
      console.log("HEERE2");
      const json = await response.json();
      // console.log("name");
      if(!json.error){
        const history =await getHistoryObject();

        const value = {
          Reciever: QRData.receiverDid,
          Type: credential.type,
          CredentialDID: credential.hash,
          Access: true,
        };

        if(history){
           
            if(checkCredential(value,history)){
              history.shareHistory.push(value);
              const jsonValue = JSON.stringify(history);
              await AsyncStorage.setItem('ShareHistory', jsonValue);
            }
        }else{
            // Save Credential
            const historyNew= {
              shareHistory : []
            };
            historyNew.shareHistory.push(value);
            const jsonValue = JSON.stringify(historyNew);
            await AsyncStorage.setItem('ShareHistory', jsonValue);
        }  
      }else{
        alert(`Credential couldn't be shared`);
      }

      navigation.navigate("Verifier");

    }

    const checkCredential = (value,curr_credentials) => {
              if(curr_credentials){
                  for (var i = 0; i < curr_credentials.shareHistory.length; ++i) {
                  // curr_credentials.credentials.forEach(element => {
                      if(curr_credentials.shareHistory[i].Reciever==value.Reciever && curr_credentials.shareHistory[i].Type==value.Type){
                          alert(`Credential ${value.type} is already shared with ${value.Reciever}`);
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
  
    const getHistoryObject = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('ShareHistory')
        return jsonValue != null ? JSON.parse(jsonValue) : null
      } catch(e) {
          console.log(e);
      }
     
    }

    // if (hasPermission === null) {
    //   return <Text>Requesting for camera permission</Text>;
    // }
    // if (hasPermission === false) {
    //   return <Text>No access to camera</Text>;
    // }
  
    return (
      <View style={styles.container}>
        
        <Text style = {styles.textStyle}>Click on the document you want to share</Text> 
        {
          verifiableCredentials[0] 
          ? <FlatList
          data={verifiableCredentials}  
          keyExtractor= {credential => credential.hash}
          renderItem = {({item})=> {
            // console.log(credential);
              return (
                
              <View>
                <TouchableOpacity
                  // style={styles.button}
                  onPress={()=>{onlistItemPress(item)}}
                >
                  <Text style = {styles.textStyle}>{item.type}</Text>
                  <Text style = {styles.subtextStyle}>{item.issuanceDate}</Text>
                </TouchableOpacity>
              {/* <Text style = {styles.textStyle}>{item.title}</Text>
              <Text style = {styles.subtextStyle}>{item.subtitle}</Text> */}
              {/* <Text style = {styles.textStyle}></Text> */}
              </View>
              );
        }}
        /> 
          : null
        }
                 
        {/* { scanned ? <QRScanner setScanned={setScanned} setData={setData}/> : null }
        
        { data!= "" ? <Text>{data}</Text> : null } */}
        {/* {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />} */}
      </View>
    );


}

const styles = StyleSheet.create({
    text: {
      fontSize: 30,
    },
    textStyle: {
      paddingTop: 10,
      paddingLeft: 10,
      fontSize: 15,
    },
    subtextStyle: {
      paddingBottom: 10,
      paddingLeft: 10,
      fontSize: 10,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
      },
  });
  
export default DocSelectScreen;