import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert,FlatList } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import walletAPI from "../api/walletAPI"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Dialog from "react-native-dialog";
import {
  ListItem,
  Avatar,
  Button as Button_native
} from 'react-native-elements';
import { MaterialIcons  } from '@expo/vector-icons'; 
import sha256 from 'crypto-js/sha256';

const VerifierScreen = ({navigation}) => {
    
    const [hasPermission, setHasPermission] = useState(null);
    const [currentCredential, setCurrentCredential] = useState({});
    const [currentCredentialIndex, setCurrentCredentialIndex] = useState({});
    const [credentialShareHistory,setCredentialShareHistory] = useState([]);
    const [scanned, setScanned] = useState(0);
    const [visible, setVisible] = useState(false);
    const [userDid, setUserDid] = useState("");

    // if(verifiableCredentials[0])
    //   console.log(verifiableCredentials[0].id);

    useEffect(() => {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        const LocalAuthenticationOptions = {
          promptMessage: "Confirm your identity",
          // disableDeviceFallback : true
        }
         LocalAuthentication.authenticateAsync(LocalAuthenticationOptions).then(async result=>{
            if(result.success){
    
            }else{
              Alert.alert(
                'Biometric record not found',
              );
              navigation.navigate('Home');
            }
        })
        
      })(); 
    }, []);

    const getCredentialsObject = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('ShareHistory')
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
            setCredentialShareHistory(temp.shareHistory);
          }
        } catch(e) {
          console.log(e);
        }
        // setCredentialShareHistory([
        //   {
        //     "Reciever":"did:ethr:0xf43257e786c47e1757ddf51b7f08f01f11bdc873",
        //     "Type": "Transcript",
        //     "CredentialDID": "did:ethr:0x0360af285db7b5022b5c648881c30bdb1fa80704",
        //     "Access": false,
        //   }
        // ])  
      })(); 
    },[scanned]);

    useEffect(() => {
      (async () => {
        try {
          const temp =await getCredentialsObject();
          // console.log("HERE EFFECT")
          // console.log(temp);
          if(temp){
            setCredentialShareHistory(temp.shareHistory);
          }
        } catch(e) {
          console.log(e);
        } 
      })(); 
    },[]);

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

    const openQRScanner = ()=>{
      navigation.navigate("QRScan",{ setScanned:setScanned, scanned:scanned,type:'verifier' })
    }

    const onlistItemPress = (credential,index)=>{
      
      // OPTION TO REVOKE ACCESS
      // console.log(index);
      setCurrentCredentialIndex(index);
      setCurrentCredential(credential);
      if(!credential.Access){
        alert("Access has already been Revoked!");
      }else{
        setVisible(true);
      }
      
    }
  

    if (hasPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    const handleCancel = () => {
      setVisible(false);
    };
  
    const handleAccessRevoke = async () => {

      const did =await getUserDID();

      const hash =  sha256(did).toString();
        // console.log("Hash="+hash);
        const keys = await AsyncStorage.getItem('Keys');
        const keysObj=JSON.parse(keys);
        // console.log("Private Key="+keysObj.PrivateKey);
        const resp = await walletAPI.post("/sign",{
            hash: hash,
            privateKey: keysObj.PrivateKey,
        });

      const response = await walletAPI.post("/revokeAccess",{
        credDID: currentCredential.CredentialDID,
        ownerDID: did, 
        hash: hash, 
        sign: resp.data.sign, 
        receiverDID: currentCredential.Reciever,
      });

      if(response.status==200){
        const temp ={
          Reciever: currentCredential.Reciever,
          Type: currentCredential.Type,
          CredentialDID: currentCredential.CredentialDID,
          Access: false,
          RecieverName: currentCredential.RecieverName, 
        }
        setCurrentCredential(temp);
        const tempSharedHistory = credentialShareHistory;
        tempSharedHistory[currentCredentialIndex]= temp;
        setCredentialShareHistory(tempSharedHistory);
        const historyObject = {
          shareHistory: tempSharedHistory
        }
        const jsonValue = JSON.stringify(historyObject);
        await AsyncStorage.setItem('ShareHistory', jsonValue);
        // console.log(historyObject);
        // console.log()
        alert("Access Successfully Revoked!");
        // credentialShareHistory
      }else{
        alert("Access Revoke Failed");
      }
      // Hndle Revoke Access
      setVisible(false);
    };
  
    return (
      <View style={styles.container}>
        
        <View style={styles.button_Container}>
          <Button_native
                title="Scan QR Code"
                onPress={()=> {
                  openQRScanner();
                }}
                icon={scanIcon}
               
                iconContainerStyle={{ marginRight: 10 }}
                buttonStyle={{
                  backgroundColor: 'rgba(78, 116, 289, 1)',
                  borderRadius: 3,
                  alignSelf: 'stretch',
                }}
                containerStyle={{
                  // width: 200,
                  flex: 1,
                  marginHorizontal: 10,
                  marginVertical: 10,
                }}
            />
          </View> 

        <Dialog.Container visible={visible} onBackdropPress={handleCancel}>
            <Dialog.Title>{currentCredential.Type}</Dialog.Title>
            <Dialog.Description>
              The credential {currentCredential.Type} is shared with {currentCredential.RecieverName}
              {'\n'}
              {'\n'}
              Do you want to revoke access to this Credential? You cannot undo this action.
            </Dialog.Description>
            <Dialog.Button label="No" onPress={handleCancel} />
            <Dialog.Button label="Revoke Access" onPress={handleAccessRevoke} />
        </Dialog.Container>
        <Text style = {styles.textHeadingStyle}>Credential Share History</Text>          
        {
          // credentialShareHistory ? 
          credentialShareHistory.map((item, i) => (
            <ListItem key={i} onPress={()=>{onlistItemPress(item,i)}} bottomDivider style={styles.listItemStyle}>
              <Avatar source={require('./../../assets/documentIcon.png')} />
              <ListItem.Content>
                <ListItem.Title>Type: {item.Type}</ListItem.Title>
                <ListItem.Subtitle style={styles.subtextStyle}>Reciever Name: {item.RecieverName}</ListItem.Subtitle>
                <ListItem.Subtitle style={styles.subtextStyle}>Reciever DID: {item.Reciever}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))
        // : null
        }
      </View>
    );
}

const scanIcon=()=>{
  return <MaterialIcons name="qr-code-scanner" size={24} color="white" style={styles.iconStyle}/>
}

const styles = StyleSheet.create({
    text: {
      fontSize: 30,
    },
    iconStyle: {
      marginRight:10
    },
    textHeadingStyle: {
      paddingTop: 10,
      paddingLeft: 10,
      fontSize: 18,
      fontWeight:"bold",
    },
    textStyle: {
      paddingTop: 10,
      paddingLeft: 10,
      fontSize: 15,
    },
    subtextStyle: {
      // paddingBottom: 10,
      // paddingLeft: 10,
      fontSize: 12,
    },
    listItemStyle: {
      margin: 5,
      borderWidth: 2,
      borderRadius: 1.5,
    },
    container: {
        // flex: 1,
        flexDirection: 'column',
        // justifyContent: 'center',
    },
    button_Container: {
      // flex: 1,
      // borderWidth: 10,
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'center',
    },
  });
  
export default VerifierScreen;