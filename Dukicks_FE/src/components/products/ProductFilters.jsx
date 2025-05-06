import React, { useEffect, useState } from 'react';
import { Form, Button, Accordion, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const ProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    isDiscounted: searchParams.get('isDiscounted') || '',
    minRating: searchParams.get('minRating') || '',
    sizes: searchParams.get('sizes')?.split(',') || [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchBrands = async () => {
      try {
        const data = await api.get('products/brands');
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'sizes') {
      if (checked) {
        setFilters((prev) => ({
          ...prev,
          sizes: [...prev.sizes, value],
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          sizes: prev.sizes.filter((size) => size !== value),
        }));
      }
    }
    else if (type === 'checkbox') {
      setFilters((prev) => ({ ...prev, [name]: checked ? 'true' : '' }));
    }
    else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const applyFilters = () => {
    const newParams = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === 'sizes' && Array.isArray(value) && value.length > 0) {
          newParams[key] = value.join(',');
        } else if (value && !(Array.isArray(value) && value.length === 0)) {
          newParams[key] = value;
        }
      }
    });

    const search = searchParams.get('search');
    if (search) {
      newParams.search = search;
    }

    const sortBy = searchParams.get('sortBy');
    if (sortBy) {
      newParams.sortBy = sortBy;
    }

    setSearchParams(newParams);
  };

  const resetFilters = () => {
    const newParams = {};
    const search = searchParams.get('search');
    if (search) {
      newParams.search = search;
    }

    const sortBy = searchParams.get('sortBy');
    if (sortBy) {
      newParams.sortBy = sortBy;
    }

    setSearchParams(newParams);
    setFilters({
      categoryId: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      isDiscounted: '',
      minRating: '',
      sizes: [],
    });
  };

  return (
    <div className='product-filters'>
      <h4>Filtri</h4>

      <Accordion defaultActiveKey={['0', '1', '2', '3', '4', '5']} alwaysOpen>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>Categorie</Accordion.Header>
          <Accordion.Body>
            <Form.Group className='mb-3'>
              <Form.Select
                name='categoryId'
                value={filters.categoryId}
                onChange={handleFilterChange}
              >
                <option value=''>Tutte le categorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey='1'>
          <Accordion.Header>Brand</Accordion.Header>
          <Accordion.Body>
            <Form.Group className='mb-3'>
              <Form.Select
                name='brand'
                value={filters.brand}
                onChange={handleFilterChange}
              >
                <option value=''>Tutti i brand</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey='2'>
          <Accordion.Header>Prezzo</Accordion.Header>
          <Accordion.Body>
            <Form.Group className='mb-3'>
              <Form.Label>Prezzo minimo</Form.Label>
              <Form.Control
                type='number'
                name='minPrice'
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder='€ Min'
                min='0'
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Prezzo massimo</Form.Label>
              <Form.Control
                type='number'
                name='maxPrice'
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder='€ Max'
                min='0'
              />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey='4'>
          <Accordion.Header>Valutazione</Accordion.Header>
          <Accordion.Body>
            <Form.Group className='mb-3'>
              <Form.Label>Valutazione minima</Form.Label>
              <Form.Select
                name='minRating'
                value={filters.minRating}
                onChange={handleFilterChange}
              >
                <option value=''>Tutte le valutazioni</option>
                <option value='5'>5 stelle</option>
                <option value='4'>4+ stelle</option>
                <option value='3'>3+ stelle</option>
                <option value='2'>2+ stelle</option>
                <option value='1'>1+ stella</option>
              </Form.Select>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey='5'>
          <Accordion.Header>Offerte</Accordion.Header>
          <Accordion.Body>
            <Form.Group className='mb-3'>
              <Form.Check
                type='checkbox'
                name='isDiscounted'
                id='isDiscounted'
                label='Solo prodotti in saldo'
                checked={filters.isDiscounted === 'true'}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <div className='d-grid gap-2 mt-3'>
        <Button variant='primary' onClick={applyFilters}>
          Applica filtri
        </Button>
        <Button variant='outline-secondary' onClick={resetFilters}>
          Resetta filtri
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
