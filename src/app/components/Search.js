import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faSearch } from '@fortawesome/free-solid-svg-icons';
import { LambdaService } from '../lambda/lambdaSevice';

export default function Search(props) {
  const [lambdaData, setLambdaData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesWithItems, setCategoriesWithItems] = useState([]);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const data = await fetchData();
      setLambdaData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const fetchData = async () => {
    try {
      const data = await LambdaService(searchTerm || '');
      // Filtrar las categorías con elementos asociados
      const categories = data.map(item => item.category_name.toLowerCase());
      const uniqueCategories = [...new Set(categories)];
      setCategoriesWithItems(uniqueCategories);
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  useEffect(() => {
    fetchData().then((data) => {
      setLambdaData(data);
    }).catch((error) => {
      throw error;
    });
  }, []);
  
  const handleAddPOI = (poi) => {
    poi.latitude = parseFloat(poi.latitude);
    poi.longitude = parseFloat(poi.longitude);
    props.onAddPOI(poi);
  };

  const sites = [
    "FARMACIAS",
    "SUPERMERCADOS",
    "CAFETERIAS Y SALONES DE TE",
    "ALMACENES",
    "RESTAURANTES",
    "BANCOS"
  ];

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCategoryClick = (category) => {
    setExpandedCategory((prevExpandedCategory) => (
      prevExpandedCategory === category ? null : category
    ));
  };

  const selectItem = (itemIndex) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      const index = updatedSelectedItems.indexOf(itemIndex);
      if (index !== -1) {
        updatedSelectedItems.splice(index, 1);
      } else {
        updatedSelectedItems.push(itemIndex);
      }
      return updatedSelectedItems;
    });
  }
  

  return (
    <Form>
      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
        <Form.Label>Búsqueda de POIs</Form.Label>
        <div className="input-group">
          <Form.Control
            type="text"
            placeholder="Busca categorias o lugares de interés"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Buscar</button>
        </div>
      </Form.Group>
      <>
        {sites.map((site, index) => {
          const normalizedSite = site.toLowerCase();
          // Verificar si la categoría tiene elementos asociados
          const categoryHasItems = categoriesWithItems.includes(normalizedSite);
          return (
            <div key={index}>
              {categoryHasItems && ( // Ocultar si la categoría no tiene elementos asociados
                <Navbar className="bg-body-tertiary mt-1">
                  <Container onClick={() => handleCategoryClick(site)} style={{ cursor: 'pointer' }}>
                    <Navbar.Brand
                      className='siteName'
                      aria-expanded={expandedCategory === site ? 'true' : 'false'}
                      aria-controls={`results-${index}`}
                    >
                      {site} {expandedCategory === site ? '-' : '+'}
                    </Navbar.Brand>
                  </Container>
                </Navbar>
              )}
              {expandedCategory === site && (
                <div className="result-container">
                  <ul className="ml-4 accordion-list" style={{ justifyContent: 'flex-end' }}>
                    {lambdaData
                      .filter(item => item.category_name.toLowerCase() === normalizedSite)
                      .map((result, idx) => (
                        <li key={idx} className="selectable-item">{result.name}
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className={`watch-${idx} watch-icon`}
                            onClick={() => { handleAddPOI(result); selectItem(result.id); }}
                            style={{ color: selectedItems.includes(result.id) ? 'red' : 'black' }}
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </>
    </Form>
  );

}
