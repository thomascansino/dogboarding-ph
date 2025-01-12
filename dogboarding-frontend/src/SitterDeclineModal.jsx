import './App.css'
import './SitterDeclineModal.css'

function SitterDeclineModal({ closeSitterDeclineModal, confirmSitterDeclineModal }) {
    

    return (
        <div className='modal'>
            <div className='overlay' onClick={closeSitterDeclineModal}></div>
            <div className='modal-form'>
                <div className='sitter-decline-modal-main-container'>
                    <div className='sitter-decline-modal-main-text'>
                        <span className='bold'>Are you sure you want to decline this booking?</span>
                    </div>
                    <div className='sitter-decline-modal-main-text'>
                        This action can’t be undone, and the client will be notified.
                    </div>
                    
                    <div className='sitter-decline-modal-main-button-container'>
                        <button onClick={closeSitterDeclineModal} className='sitter-decline-modal-main-button sitter-decline-modal-brown-bg shadow'>Cancel</button>
                        <button onClick={confirmSitterDeclineModal} className='sitter-decline-modal-main-button sitter-decline-modal-red-bg shadow'>Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SitterDeclineModal;