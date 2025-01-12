import './App.css'
import './ImageModal.css'

function ImageModal({ closeImageModal, selectedImage }) {


    return (
        <div className='modal'>
            <div className='overlay' onClick={closeImageModal}></div>
            <div className='image-modal-image-container'>
                <img src={`https://drive.google.com/thumbnail?id=${selectedImage}`} alt='selected image' className='image-modal-image' />
            </div>
        </div>
    );
};

export default ImageModal;