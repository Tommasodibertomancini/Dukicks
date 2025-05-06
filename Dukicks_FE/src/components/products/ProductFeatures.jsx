import React from 'react';
import { Table } from 'react-bootstrap';

const ProductFeatures = ({ features }) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className='product-features'>
      <h5 className='mb-3'>Caratteristiche</h5>
      <Table striped bordered hover size='sm'>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.id}>
              <td className='fw-bold'>{feature.name}</td>
              <td>{feature.value}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductFeatures;
