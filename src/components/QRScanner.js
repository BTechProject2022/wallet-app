import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { BarCodeScanner } from 'expo-barcode-scanner';

const QRScanner = ({setData,setScanned}) => {
    
    const [scan, setScan] = useState(false);
  
    useEffect(() => {

    }, []);
  
    const handleBarCodeScanned = ({ type, data }) => {
      setScan(true);
      setScanned(false);
      setData(data);
      // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };

    return (
      <View style={styles.container}>
          
        <BarCodeScanner
          onBarCodeScanned={scan ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    );


}

const styles = StyleSheet.create({
    text: {
      fontSize: 30,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
      },
  });
  
export default QRScanner;