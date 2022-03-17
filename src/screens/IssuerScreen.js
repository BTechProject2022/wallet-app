import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert,FlatList } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import walletAPI from "../api/walletAPI"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
// import QRScanner from './../components/QRScanner'
import visit from './../utils/ObjectIterator'
import {
  ListItem,
  Avatar,
  Button as Button_native
} from 'react-native-elements';
import { MaterialIcons  } from '@expo/vector-icons'; 

const IssuerScreen = ({navigation}) => {
    
    const [hasPermission, setHasPermission] = useState(null);
    const [data, setData] = useState("");
    const [verifiableCredentials,setVerifiableCredentials] = useState([]);
    const [scanned, setScanned] = useState(0);

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


    const openQRScanner = ()=>{
      navigation.navigate("QRScan",{ setScanned:setScanned, scanned:scanned ,type:'issuer'})
    }

    const onlistItemPress = (credential)=>{
      
      // var result= visit(credential,null);
      // console.log("Result="+result);
      // console.log(result);
      navigation.navigate("DocDisplay",{ type:"Credential", id:credential.hash })
      // alert(result);
    }
  

    if (hasPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }
  
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
        <Text style={styles.titleStyle}>Previously Issued Credentials</Text>
        {
          verifiableCredentials.map((l, i) => (
            <ListItem key={i} onPress={()=>{onlistItemPress(l)}} bottomDivider style={styles.listItemStyle}>
              <Avatar source={require('./../../assets/documentIcon.png')} />
              <ListItem.Content>
                <ListItem.Title>{l.type}</ListItem.Title>
                <ListItem.Subtitle>{l.issuanceDate}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))
        }
      </View>
    );


}

const scanIcon=()=>{
  // return <ScanOutlined />
  return <MaterialIcons name="qr-code-scanner" size={24} color="white" style={styles.iconStyle}/>
}

const styles = StyleSheet.create({
    text: {
      fontSize: 30,
    },
    titleStyle: {
      fontSize: 20,
      marginLeft:5,
      marginTop: 10
    },
    iconStyle: {
      marginRight:10
    },
    listItemStyle: {
      margin: 5,
      borderWidth: 2,
      borderRadius: 1.5,
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
  
export default IssuerScreen;