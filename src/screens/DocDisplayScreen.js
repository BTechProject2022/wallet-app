import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert,ScrollView } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { BarCodeScanner } from 'expo-barcode-scanner';
import visit from './../utils/ObjectIterator'
import AsyncStorage from '@react-native-async-storage/async-storage';
import CredentialView from '../components/CredentialView';
import getCredential from "./../utils/GetCredential"

const DocDisplayScreen = ({navigation}) => {
    
    // var schema={};
    const [data, setData] = useState({});
  
    useEffect(() => {
      
      const type = navigation.state.params.type;
      // if(type==="DID_Document"){
      //     AsyncStorage.getItem('DID_Document').then(async (res)=>{
      //       if(res){
      //         const temp = JSON.parse(res);
      //         var result= visit(temp,null);
      //         const YAML = require('json-to-pretty-yaml');
      //         const data = YAML.stringify(temp);
      //         setData(result);
      //         // console.log(res);
      //       } else {
      //         alert("DID Document not Found");
      //       }
      //     });
      // }else{
        // AsyncStorage.getItem('Credentials').then(async (res)=>{
        //   if(res){
        //     // console.log(schema);
        //     const temp = JSON.parse(res);
        //     for(var i=0;i<temp.credentials.length;i=i+1){
        //       if(temp.credentials[i].id===navigation.state.params.id){
        //         // var result= visit(temp.credentials[i],null);
        //         // AsyncStorage.getItem('Schemas').then(async (res2)=>{
        //         //   if(res2){
        //         //     // console.log(schema);
        //         //     const temp2 = JSON.parse(res2);
        //         //     setSchema(temp2.schemas[i]);
        //         //     // console.log(schema);
        //         //   }
        //         // });
        //         setData(temp.credentials[i]);
        //         break;
        //       }
        //     }
        //     // console.log(res);
        //   } else {
        //     alert("DID Document not Found");
        //   }
        // });
      // }
      (async () => {
        AsyncStorage.getItem('DID').then(async (res)=>{
          const credential = await getCredential(navigation.state.params.id,res);
          setData(credential);
        });
      })();
      
      
    }, []);
  
    const isEmptyObject= (obj)=> {
      // console.log(obj)
      return JSON.stringify(obj) === '{}';
    }

    return (
      <>
        { !isEmptyObject(data) 
          ? 
          <View style={styles.container}>
            {/* <Text>{data}</Text> */}
            {navigation.state.params.type === "Credential"
              ? <View> 
                <Text style={styles.title}>Title: {data.type[1]}</Text>
                <Text />
                <Text style={styles.subTitle}>Issuer: {data.issuerDID}</Text>
                <Text />
                <CredentialView object={data}/>
              </View>
              : null
            }
          </View>
        : null}
      </>

    );


}

const styles = StyleSheet.create({
    title: {
      fontSize: 20,
    },
    subTitle: {
      fontSize: 17,
    },
    container: {
        margin:5,
        padding: 10,
        // flex: 1,
        flexDirection: 'column',
        borderWidth: 5,
        borderColor: 'black',
        // justifyContent: 'center',
      },
  });
  
export default DocDisplayScreen;