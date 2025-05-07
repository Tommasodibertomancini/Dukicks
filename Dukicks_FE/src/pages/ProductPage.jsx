import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Alert,
  Pagination,
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import ProductSearch from '../components/products/ProductSearch';
import ProductSort from '../components/products/ProductSort';
import productService from '../services/ProductService';
import categoryService from '../services/CategoryService';
import '../styles/animation.css'

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(9);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesList = await categoryService.getCategories();
        setCategories(categoriesList || []);
      } catch (err) {
        console.error('Errore nel caricamento delle categorie:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    } else {
      setCurrentPage(1);
    }

    const limitParam = searchParams.get('limit');
    if (limitParam) {
      setProductsPerPage(parseInt(limitParam, 10));
    }
  }, [searchParams]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoading(true);

        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        params.page = params.page || currentPage;
        params.limit = params.limit || productsPerPage;

        const response = await productService.getProducts(params);

        if (Array.isArray(response)) {
          console.log('Received array response');
          setProducts(response);
          setTotalProducts(response.length);
          setTotalPages(1);
        } else {
          console.log('Received paged response');
          setProducts(response.items);
          setTotalProducts(response.total);
          setCurrentPage(response.page);
          setTotalPages(response.totalPages);

          if (!params.page || !params.limit) {
            const newSearchParams = new URLSearchParams(searchParams);
            if (!params.page) newSearchParams.set('page', response.page);
            if (!params.limit) newSearchParams.set('limit', response.limit);
            setSearchParams(newSearchParams, { replace: true });
          }
        }
      } catch (err) {
        console.error('Errore nel caricamento dei prodotti:', err);
        setError(err.message || 'Errore durante il caricamento dei prodotti');
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePageChange = (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === currentPage
    ) {
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', pageNumber);
    setSearchParams(newSearchParams);
  };

  const handleLimitChange = (newLimit) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('limit', newLimit);
    newSearchParams.set('page', 1);
    setSearchParams(newSearchParams);
  };

  const renderPaginationItems = () => {
    const items = [];

    items.push(
      <Pagination.Prev
        key='prev'
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    const maxPagesVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesVisible - 1);

    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesVisible + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key='ellipsis-start' disabled />);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key='ellipsis-end' disabled />);
      }
      items.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key='next'
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  const getPageTitle = () => {
    const categoryId = searchParams.get('categoryId');
    const categoryParam = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    if (search) {
      return `Risultati per "${search}"`;
    }

    let categoryName = '';

    if (categoryId) {
      const category = categories.find((c) => c.id === parseInt(categoryId));
      categoryName = category ? category.name : `Categoria #${categoryId}`;
    } else if (categoryParam) {
      categoryName = categoryParam;
    }

    if (categoryName && brand) {
      return `${brand} - ${categoryName}`;
    }

    if (categoryName) {
      return categoryName;
    }

    if (brand) {
      return brand;
    }

    return 'Tutti i Prodotti';
  };

  return (
    <>
      <Container className='products-page-container'>
        <h1 className='my-4'>{getPageTitle()}</h1>

        <Row>
          {/* Sidebar con filtri */}
          <Col lg={3} className='mb-4'>
            <ProductFilters />
          </Col>

          {/* Prodotti */}
          <Col lg={9}>
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4'>
              <ProductSearch />
              <ProductSort />
            </div>

            {isLoading ? (
              <div class='spinner-container'>
                <div class='newtons-cradle'>
                  <div class='newtons-cradle__dot'></div>
                  <div class='newtons-cradle__dot'></div>
                  <div class='newtons-cradle__dot'></div>
                  <div class='newtons-cradle__dot'></div>
                </div>
              </div>
            ) : error ? (
              <Alert variant='danger'>Si è verificato un errore: {error}</Alert>
            ) : products.length === 0 ? (
              <Alert variant='info'>
                Nessun prodotto trovato con i filtri selezionati.
              </Alert>
            ) : (
              <>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                  <p className='text-muted mb-0'>
                    {totalProducts === 1
                      ? '1 prodotto trovato'
                      : `${totalProducts} prodotti trovati`}
                    {totalPages > 1 &&
                      `, pagina ${currentPage} di ${totalPages}`}
                  </p>

                  <div className='d-flex align-items-center'>
                    <span className='me-2'>Prodotti per pagina: </span>
                    <select
                      className='form-select form-select-sm'
                      style={{ width: 'auto' }}
                      value={productsPerPage}
                      onChange={(e) =>
                        handleLimitChange(Number(e.target.value))
                      }
                    >
                      <option value='6'>6</option>
                      <option value='9'>9</option>
                      <option value='12'>12</option>
                      <option value='24'>24</option>
                    </select>
                  </div>
                </div>

                <Row xs={1} sm={2} md={3} className='g-4'>
                  {products.map((product) => (
                    <Col key={product.id}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>

                {/* Paginazione */}
                {totalPages > 1 && (
                  <div className='d-flex justify-content-center mt-4'>
                    <Pagination>{renderPaginationItems()}</Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ProductPage;
