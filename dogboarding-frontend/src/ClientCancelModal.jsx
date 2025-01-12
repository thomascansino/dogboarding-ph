import ClipLoader from 'react-spinners/ClipLoader'
import './App.css'
import './ClientCancelModal.css'

function ClientCancelModal({ closeClientCancelModal, confirmClientCancelModal, isLoading }) {

    return (
        <div className='modal'>
            <div className='overlay' onClick={closeClientCancelModal}></div>
            <div className='modal-form'>
                <div className='client-cancel-modal-main-container'>
                    <div className='client-cancel-modal-main-text'>
                        <span className='bold'>Are you sure you want to cancel this booking?</span>
                    </div>
                    <div className='client-cancel-modal-main-text'>
                        This action can’t be undone, and the sitter will be notified.
                    </div>
                    
                    <div className='client-cancel-modal-main-button-container'>
                        <button onClick={closeClientCancelModal} className='client-cancel-modal-main-button client-cancel-modal-brown-bg shadow'>Cancel</button>
                        { isLoading ?
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <ClipLoader
                            color='#5E3104'
                            loading={isLoading}
                            size={25}
                            />
                        </div> :
                        <button onClick={confirmClientCancelModal} className='client-cancel-modal-main-button client-cancel-modal-red-bg shadow'>Confirm</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientCancelModal;