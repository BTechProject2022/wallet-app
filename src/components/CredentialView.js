import React, {useState,useEffect} from 'react';
import { Text, StyleSheet, Button, View, TouchableOpacity,FlatList } from 'react-native';

const CredentialView = ({properties,object}) => {
    
  
    useEffect(() => {
        // console.log(properties);
        // Object.keys(obj)
    }, []);
  
    const nameFormatter = (data)=>{
        console.log(data.length);
        var temp =  "";
        // for (var i=0;i<data.length;i=i++){
        //     const curr = data.charAt(i);
            // if(i==0){
            //     temp.concat(curr.toUpperCase());
            // }else{
                
            //     if(curr == curr.toUpperCase()){
            //         // temp += ' ';
            //     }
            //     temp.concat(curr);
            // }
            // console.log(curr);
        // }
        // console.log(temp);
        // temp = temp.subString(0,1).toUpp
        return temp;
    }
    
    return (
        <View>
            <Text style = {styles.textStyle}>ID: {object.credentialSubject['id']}</Text>
            <Text />
            <FlatList
            data={properties}  
            keyExtractor= {property => property.key}
            renderItem = {({item})=> {
            // console.log(credential);
                return (
                
                <View>
                    {/* <Text style = {styles.textStyle}>{(Object.keys(item)[0])}: {object.credentialSubject[Object.keys(item)[0]]}</Text> */}
                    <Text style = {styles.textStyle}>{item.key}: {object.credentialSubject[item.key]}</Text>
                    <Text />
                </View>
                );
        }}
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
  
export default CredentialView;