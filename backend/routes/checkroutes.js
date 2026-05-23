const express=require('express');
const pass=require('../models/pass');
const CheckLog=require('../models/checklogs');
const authmiddleware=require('../middleware/authmiddleware');
const router=express.Router();
//check in 
