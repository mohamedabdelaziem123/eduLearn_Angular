import { GenderEnum, logoutEnum } from "../../enums";


export interface sendConfirmEmailOtpBodyDto {


  email: string;
}
export interface ConfirmEmailOtpBodyDto extends sendConfirmEmailOtpBodyDto {



  code: string;
}
export interface LoginBodyDto extends sendConfirmEmailOtpBodyDto {

  password: string;
}

export interface SignupBodyDto extends LoginBodyDto {



  username: string;



  confirmpassword: string;


  phone: string;


  address: string;


  gender: GenderEnum;
}

export interface SendforgotpasswordDto {


  email: string;
}

export interface VerfiyforgotpasswordDto extends SendforgotpasswordDto {



  otp: string;
}

export interface resetforgotpasswordDto extends LoginBodyDto {


  confirmpassword: string;
}

export interface signupWithGmailDto {


  idToken: string;
}

export interface RefreshTokenDto {


  refresh_token: string;
}

export interface logoutDto {


  method: logoutEnum;
}
