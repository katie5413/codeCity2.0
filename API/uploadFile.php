<?php
    if($_FILES["file"]["error"]>0){
        echo "Error.".$_FILES["file"]["error"];
    }
    else{
        echo "檔案名稱:".$_FILES["file"]["name"]."<br/>";
        echo "檔案類型:".$_FILES["file"]["type"]."<br/>";
        echo "檔案大小:".$_FILES["file"]["size"]."<br/>";
        echo "檔案暫存:".$_FILES["file"]["tmp_name"]."<br/>";
        if(!file_exists("../tmp")){
           mkdir("../tmp",0700);
        }
        if(file_exists("../tmp/".$_FILES["file"]["name"])){
           echo "檔案已存在<br/>";
        }
        else{
            move_uploaded_file($_FILES["file"]["tmp_name"], "../tmp/".$_FILES["file"]["name"]);
        }
    }
