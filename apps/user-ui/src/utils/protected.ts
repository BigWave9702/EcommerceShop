import {CustomAxiosRequestConfig} from "./axiosInsstance.type";


export const isProtected: CustomAxiosRequestConfig = {
  requireAuth: true,
};
