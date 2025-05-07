import React, { useState } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

const SizeGuide = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        variant='link'
        className='p-0 text-decoration-underline mb-2 text-secondary'
        onClick={handleShow}
        style={{ fontSize: '0.875rem' }}
      >
        Guida alle taglie
      </Button>

      <Modal show={show} onHide={handleClose} size='lg'>
        <Modal.Header closeButton className='sizeguide'>
          <Modal.Title className='sizeguide'>Guida alle taglie</Modal.Title>
        </Modal.Header>
        <Modal.Body className='sizeguide'>
          <p className='mb-4'>
            Utilizza questa guida per trovare la taglia perfetta per te. Misura
            il tuo piede dalla punta del dito più lungo al tallone per ottenere
            la lunghezza in centimetri.
          </p>

          <h5>Taglie da uomo</h5>
          <Table striped bordered hover className='mb-4'>
            <thead>
              <tr>
                <th>Taglia EU</th>
                <th>Taglia US</th>
                <th>Taglia UK</th>
                <th>Lunghezza del piede (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>39</td>
                <td>6.5</td>
                <td>6</td>
                <td>24.5</td>
              </tr>
              <tr>
                <td>40</td>
                <td>7</td>
                <td>6.5</td>
                <td>25</td>
              </tr>
              <tr>
                <td>41</td>
                <td>8</td>
                <td>7.5</td>
                <td>26</td>
              </tr>
              <tr>
                <td>42</td>
                <td>8.5</td>
                <td>8</td>
                <td>26.5</td>
              </tr>
              <tr>
                <td>43</td>
                <td>9.5</td>
                <td>9</td>
                <td>27.5</td>
              </tr>
              <tr>
                <td>44</td>
                <td>10</td>
                <td>9.5</td>
                <td>28</td>
              </tr>
              <tr>
                <td>45</td>
                <td>11</td>
                <td>10.5</td>
                <td>29</td>
              </tr>
              <tr>
                <td>46</td>
                <td>12</td>
                <td>11.5</td>
                <td>30</td>
              </tr>
            </tbody>
          </Table>

          <h5>Taglie da donna</h5>
          <Table striped bordered hover className='mb-4'>
            <thead>
              <tr>
                <th>Taglia EU</th>
                <th>Taglia US</th>
                <th>Taglia UK</th>
                <th>Lunghezza del piede (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>35</td>
                <td>5</td>
                <td>2.5</td>
                <td>22</td>
              </tr>
              <tr>
                <td>36</td>
                <td>5.5</td>
                <td>3.5</td>
                <td>22.5</td>
              </tr>
              <tr>
                <td>37</td>
                <td>6.5</td>
                <td>4</td>
                <td>23.5</td>
              </tr>
              <tr>
                <td>38</td>
                <td>7</td>
                <td>5</td>
                <td>24</td>
              </tr>
              <tr>
                <td>39</td>
                <td>8</td>
                <td>6</td>
                <td>25</td>
              </tr>
              <tr>
                <td>40</td>
                <td>9</td>
                <td>6.5</td>
                <td>25.5</td>
              </tr>
              <tr>
                <td>41</td>
                <td>9.5</td>
                <td>7.5</td>
                <td>26</td>
              </tr>
              <tr>
                <td>42</td>
                <td>10</td>
                <td>8</td>
                <td>27</td>
              </tr>
            </tbody>
          </Table>

          <h5>Come misurare il piede correttamente</h5>
          <ol>
            <li>
              Misura i piedi a fine giornata, quando tendono ad essere
              leggermente più grandi
            </li>
            <li>Indossa le calze che userai normalmente con le scarpe</li>
            <li>
              Posiziona un foglio di carta su una superficie piana e rigida
            </li>
            <li>Appoggia il piede sul foglio e traccia il contorno</li>
            <li>
              Misura la distanza dalla punta del dito più lungo al tallone
            </li>
            <li>
              Ripeti la misurazione per entrambi i piedi e utilizza la misura
              più grande
            </li>
          </ol>

          <div className='alert alert-info mt-3'>
            <strong>Consiglio:</strong> Se sei tra due taglie, scegli quella più
            grande per un maggiore comfort.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Chiudi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SizeGuide;
