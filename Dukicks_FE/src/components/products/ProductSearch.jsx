import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';

const ProductSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();

    const newParams = {};

    for (const [key, value] of searchParams.entries()) {
      if (key !== 'search') {
        newParams[key] = value;
      }
    }

    if (searchTerm.trim()) {
      newParams.search = searchTerm.trim();
    }

    setSearchParams(newParams);
  };

  return (
    <Form onSubmit={handleSearch} className='mb-4 w-50 product-search'>
      <InputGroup>
        <Form.Control
          type='text'
          placeholder='Cerca prodotti...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant='primary' type='submit'>
          <FaSearch />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default ProductSearch;
