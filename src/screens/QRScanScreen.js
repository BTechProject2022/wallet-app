import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import store from 'react-native-simple-store';
import walletAPI from "./../api/walletAPI"

export default function QRScannerScreen({navigation}) {

//   console.log(navigation.state.params);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');

    //   await AsyncStorage.removeItem('Credentials')

    })();



  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    setObjectValue(data).then(()=>{
        // console.log("doNE")
        navigation.state.params.setScanned(navigation.state.params.scanned+1);
        navigation.navigate("Issuer");
    })
    
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const getCredentialsObject = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('Credentials')
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch(e) {
        console.log(e);
    }
   
  }

  const getSchemaObject = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('Schemas')
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch(e) {
        console.log(e);
    }
   
  }

  const checkCredential = (credential,curr_credentials) => {
    //   if(credential.id==null || credential.title==null || credential.subtitle==null){
    if(credential.id==null){
            alert(`Invalid Credential`);
            navigation.navigate("Issuer");
            return false;
      }else{
            if(curr_credentials){
                for (var i = 0; i < curr_credentials.credentials.length; ++i) {
                // curr_credentials.credentials.forEach(element => {
                    if(curr_credentials.credentials[i].id==credential.id){
                        alert(`Credential ${credential.title} already exists`);
                        // navigation.navigate("Issuer");
                        console.log("IN FOR LOOP");
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
    const temp = JSON.parse(data);
    const responseSchema = await walletAPI.get(`/getSchema/${temp.id}`);

    // console.log(responseSchema.data);
    try {

      var curr_credentials =await getCredentialsObject();
    //   console.log(curr_credentials);
      const value = JSON.parse(data);
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
            var curr_schema =await getSchemaObject();
            curr_schema.schemas.push(responseSchema.data);
            const jsonValue2 = JSON.stringify(curr_schema);
            await AsyncStorage.setItem('Credentials', jsonValue2);

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
            const curr_schemaNew= {
              schemas : []
            };
            curr_schemaNew.schemas.push(responseSchema.data);
            const jsonValue2 = JSON.stringify(curr_schemaNew);
            await AsyncStorage.setItem('Schemas', jsonValue2);
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
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
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