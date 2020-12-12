import React, { useEffect, useState } from "react";
import { Upload, Modal, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { storage } from "../../firebase/firebase";
import "./UploadPhoto.scss";
import onConfirmHandler from "../Modal/ConfirmModal";
import {errorNotification} from "../Gallery/Gallery";

const generateUniqueID = () => {
    return "_" + Math.random().toString(36).substr(2, 9);
};

const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

const clearAllConfirm = 'Do you want to clear all these photos?';
const clearAllContent = 'Remember to upload your important photos.';

const uploadErrorMessage = 'Upload failed!';
const uploadErrorDescription = 'Cannot upload images, please try again!';

const UploadPhoto = () => {
    const [imageList, setImageList] = useState([]);
    const [totalImg, setTotalImg] = useState(0);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");

    useEffect(() => {
        setTotalImg(imageList.length);
    }, [imageList.length]);


    const onClearAll = () => {
        setImageList([]);
    };



    const handleUpload = () => {
        imageList.forEach((image) => {
            const originImage = image.originFileObj;
            originImage.id = generateUniqueID();
            const uploadTask = storage.ref(`images/${originImage.id}_${originImage.name}`).put(originImage);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                },
                (error) => {
                    errorNotification(uploadErrorMessage, uploadErrorDescription);
                },
                () => {
                    storage.ref("images").child(originImage.name);
                }
            );
        });
    };


    const handleCancel = () => setPreviewVisible(false);

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(
            file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
        );
    };

    const handleChange = ({ fileList }) => {
        setImageList(fileList);
    }

    const dummyRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div className='mt-2'>Upload</div>
        </div>
    );

    return (
        <>
            <div className="d-flex">
                <Button type="primary" danger className="mr-auto" onClick={() => onConfirmHandler(clearAllConfirm, clearAllContent, onClearAll, () => {})}>
                    Clear All
                </Button>
                <div className="ml-auto font-weight-bold">{`${totalImg} selected`}</div>
            </div>
            <Upload
                accept="image/*"
                listType="picture-card"
                fileList={imageList}
                customRequest={dummyRequest}
                onPreview={handlePreview}
                onChange={handleChange}
                multiple={true}
                className={'mt-3'}
            >
                {uploadButton}
            </Upload>
            <Modal
                visible={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={handleCancel}
            >
                <img alt="example" style={{ width: "100%" }} src={previewImage} />
            </Modal>


            <div className="d-flex justify-content-center">
                <Button type="primary" onClick={handleUpload}>
                    Upload
                </Button>
            </div>
        </>
    );
};

export default UploadPhoto;