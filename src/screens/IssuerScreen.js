import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert,FlatList } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import walletAPI from "../api/walletAPI"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
// import QRScanner from './../components/QRScanner'
import visit from './../utils/ObjectIterator'

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
      navigation.navigate("QRScan",{ setScanned:setScanned, scanned:scanned })
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
        
         <Button 
            title="Scan QR Code"
            onPress={()=> {
               openQRScanner();
            }}
          />  
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
  
export default IssuerScreen;