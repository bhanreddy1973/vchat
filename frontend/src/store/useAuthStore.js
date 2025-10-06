import {create} from "zustand";

export const useAuthStore = create((set) => ({
    authUser: { name: " Bhanu " ,_id:123 ,age: 22},
    isLoading: false,

    login : () =>{
        console.log("login");       
    }
}))
