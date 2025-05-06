import React from 'react';

const CheckoutSteps = ({ currentStep }) => {
  return (
    <div className='checkout-steps mb-4 d-flex justify-content-center'>
      <div
        className={`step ${currentStep >= 1 ? 'active' : ''} ${
          currentStep > 1 ? 'completed' : ''
        }`}
      >
        <div className='step-number'>1</div>
        <div className='step-title'>Spedizione</div>
      </div>
      <div
        className={`step-connector ${currentStep > 1 ? 'completed' : ''}`}
      ></div>
      <div
        className={`step ${currentStep >= 2 ? 'active' : ''} ${
          currentStep > 2 ? 'completed' : ''
        }`}
      >
        <div className='step-number'>2</div>
        <div className='step-title'>Pagamento</div>
      </div>
      <div
        className={`step-connector ${currentStep > 2 ? 'completed' : ''}`}
      ></div>
      <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
        <div className='step-number'>3</div>
        <div className='step-title'>Conferma</div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
