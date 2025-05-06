import React from 'react';
import { Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

const ProductSort = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSort = searchParams.get('sortBy') || 'newest';

  const handleSortChange = (e) => {
    const newSort = e.target.value;

    const newParams = {};

    for (const [key, value] of searchParams.entries()) {
      if (key !== 'sortBy') {
        newParams[key] = value;
      }
    }

    newParams.sortBy = newSort;

    setSearchParams(newParams);
  };

  return (
    <div className='d-flex align-items-center mb-4 product-sort'>
      <span className='me-2'>Ordina per:</span>
      <Form.Select
        value={currentSort}
        onChange={handleSortChange}
        style={{ width: 'auto' }}
      >
        <option value='newest'>Più recenti</option>
        <option value='price_asc'>Prezzo: dal più basso</option>
        <option value='price_desc'>Prezzo: dal più alto</option>
        <option value='name_asc'>Nome: A-Z</option>
        <option value='name_desc'>Nome: Z-A</option>
        <option value='rating'>Valutazione</option>
      </Form.Select>
    </div>
  );
};

export default ProductSort;
