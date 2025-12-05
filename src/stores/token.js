import { defineStore } from "pinia";
import * as jwtDecode from 'jwt-decode';
import { ref } from "vue";
export const useTokenStore=defineStore("token",()=>{
    const token=ref('')
    const getToken=()=>{
        return token.value
    }
    const setToken=(newToken)=>{
        token.value=newToken
    }
    const removeToken=()=>{
        token.value=""
    }
    const getTName=()=>{
        const decoded = jwtDecode.jwtDecode(getToken());
        console.log(decoded.tname)
        return decoded.tname
    }
    const getAvatar=()=>{
        const decoded = jwtDecode.jwtDecode(getToken());
        return decoded.avatar
    }
    const isTokenValid=()=>{
        if(getToken()=='')return false;
        const decoded = jwtDecode.jwtDecode(getToken());
        const currentTime = Date.now();
        return decoded.expire_time > currentTime;
    }

    return {token,getToken,setToken,removeToken,isTokenValid,getTName,getAvatar}
},{
    persist:{
        key:"piniaTokenStore",
        paths:["token"]
    }
});