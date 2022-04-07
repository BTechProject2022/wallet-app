import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert,FlatList,ScrollView } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import walletAPI from "../api/walletAPI"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
// import QRScanner from './../components/QRScanner'
import visit from '../utils/ObjectIterator'
import getCredential from "./../utils/GetCredential"
import sha256 from 'crypto-js/sha256';
import {
  ListItem,
  Avatar,
  Button as Button_native
} from 'react-native-elements';
import { MaterialIcons  } from '@expo/vector-icons'; 

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
        // console.log("PARAMS");
        // console.log(navigation.state.params);
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
            // console.log(temp.credentials);
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
      // console.log("HEERE");

      const response = await fetch(apiEndPoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: reqBody,
      });
      // console.log("HEERE11");
      const json = await response.json();
      // console.log(json);
      if(!json.error){
        const history =await getHistoryObject();

        const value = {
          Reciever: QRData.receiverDid,
          Type: credential.type,
          CredentialDID: credential.hash,
          Access: true,
          RecieverName: credential.issuerName,
        };

        if(history){
            // console.log("HISTORY EXISTS");
            // console.log(value);
            const notExists =await checkCredential(value,history);
            // console.log(history);
            if(notExists){
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
      alert(`Credential successfully shared`);
      navigation.state.params.setScanned(navigation.state.params.scanned+1);
      navigation.navigate("Verifier");

    }

    const checkCredential =async (value,curr_credentials) => {
      // console.log(value);
              if(curr_credentials){
                  for (var i = 0; i < curr_credentials.shareHistory.length; ++i) {
                  // curr_credentials.credentials.forEach(element => {
                      if(curr_credentials.shareHistory[i].Reciever==value.Reciever && curr_credentials.shareHistory[i].Type==value.Type && curr_credentials.shareHistory[i].Access){
                          alert(`Credential ${value.Type} is already shared with ${value.RecieverName}`);
                          // navigation.navigate("Issuer");
                          // console.log("IN FOR LOOP");
                          return false;
                      }
                      if(curr_credentials.shareHistory[i].Reciever==value.Reciever && curr_credentials.shareHistory[i].Type==value.Type 
                        && !curr_credentials.shareHistory[i].Access){
                          curr_credentials.shareHistory[i].Access= true;
                          const jsonValue = JSON.stringify(curr_credentials);
                          await AsyncStorage.setItem('ShareHistory', jsonValue);
                          // alert(`Credential successfully shared`);
                        // alert(`Credential ${value.Type} is already shared with ${value.RecieverName}`);
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
        
       
        <Text style={styles.titleStyle}>Click on the document you want to share</Text>
        {
          verifiableCredentials.map((l, i) => (
            <ListItem key={i} onPress={()=>{onlistItemPress(l)}} bottomDivider style={styles.listItemStyle}>
              <Avatar source={require('./../../assets/documentIcon.png')} />
              <ListItem.Content>
                <ListItem.Title>{l.type}</ListItem.Title>
                <ListItem.Subtitle>Issued By: {l.issuerName}</ListItem.Subtitle>
                <ListItem.Subtitle>{l.issuanceDate}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))
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
    titleStyle: {
      fontSize: 17,
      marginLeft:5,
      marginTop: 10
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        // justifyContent: 'center',
      },
  });
  
export default DocSelectScreen;