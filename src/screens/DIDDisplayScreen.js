import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,Alert,FlatList } from 'react-native';
import visit from '../utils/ObjectIterator'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as schema from '../utils/TransriptSchema.json';
import CredentialView from '../components/CredentialView';

const DIDDisplayScreen = ({navigation}) => {
    
    const [data, setData] = useState({});
    const [name, setName] = useState("");
    useEffect(() => {
      
      const type = navigation.state.params.type;
      if(type==="DID_Document"){
          AsyncStorage.getItem('DID_Document').then(async (res)=>{
            if(res){
              const temp = JSON.parse(res);
              setName(await AsyncStorage.getItem('Name'));
              // var result= visit(temp,null);
              // const YAML = require('json-to-pretty-yaml');
              // const data = YAML.stringify(temp);
              // console.log(temp);
              setData(temp);
              
            } else {
              alert("DID Document not Found");
            }
          });
      }

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
                <Text style={styles.title}>Context:</Text>
                <Text />
                <Text style={styles.title}>1: {data.context[0]}</Text>
                <Text />
                <Text style={styles.title}>2: {data.context[1]}</Text>
                {/* <FlatList
                    
                    style={styles.listStyle}
                    data={data.context}  
                    keyExtractor= {property => property}
                    renderItem = {({item})=> {
                    // console.log(credential);
                        return (
                            <Text >     {item}</Text>
                        );
                }}
                />  */}
                <Text />
                <Text style={styles.title}>DID: {data.did}</Text>
                <Text />
                <Text style={styles.title}>Name: {name}</Text>
                <Text />
                <Text style={styles.title}>Key:</Text>
                <Text />
                <Text style={styles.title}>   ID: {data.key.id}</Text>
                <Text />
                <Text style={styles.title}>   Method Type: {data.key.methodType}</Text>
                <Text />
                <Text style={styles.title}>   Owner: {data.key.owner}</Text>
                <Text />
                <Text style={styles.title}>   Public Key: {data.key.publicKey}</Text>
                <Text />
          </View>
        : null}
      </>

    );


}

const styles = StyleSheet.create({
    title: {
      fontSize: 15,
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
  
export default DIDDisplayScreen;