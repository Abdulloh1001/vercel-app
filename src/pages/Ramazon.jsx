import { useState, useEffect } from 'react';
import { Card, Spin, Typography, Row, Col, Pagination, Empty, Modal } from 'antd';
import { BookOutlined, LinkOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Ramazon = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const pageSize = 12; // Har sahifada 12ta maqola

  // Barcha maqolalarni yuklash
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ramazon');
        const data = await response.json();
        
        if (data.success) {
          setAllArticles(data.articles);
        } else {
          console.error('Ma\'lumot olishda xatolik:', data.error);
          setAllArticles([]);
        }
      } catch (error) {
        console.error('API xatolik:', error);
        setAllArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Maqola tarkibini yuklash
  const fetchArticleContent = async (articleUrl) => {
    try {
      setModalLoading(true);
      setModalVisible(true);
      
      const response = await fetch(`/api/ramazon?articleUrl=${encodeURIComponent(articleUrl)}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedArticle(data.article);
      } else {
        console.error('Maqola yuklashda xatolik:', data.error);
      }
    } catch (error) {
      console.error('API xatolik:', error);
    } finally {
      setModalLoading(false);
    }
  };

  // Hozirgi sahifa uchun maqolalar
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentArticles = allArticles.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '10px' }}>
            🌙 Ramazon Oyining Fazilatlari
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }}>
            Muborak Ramazon oyining maqolalari va nasihatlari
          </Text>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '20px', color: 'white', fontSize: '16px' }}>
              Maqolalar yuklanmoqda...
            </p>
          </div>
        ) : currentArticles.length > 0 ? (
          <>
            {/* Articles Grid */}
            <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
              {currentArticles.map((article, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: '15px',
                      height: '100%',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      background: 'white',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: 0 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                    }}
                    onClick={() => fetchArticleContent(article.link)}
                  >
                    {/* Rasm */}
                    {article.image && (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: `url(${article.image}) center/cover no-repeat`,
                        backgroundColor: '#f0f0f0'
                      }} />
                    )}
                      
                      {/* Content */}
                      <div style={{ padding: '20px' }}>
                        {/* Raqam badge */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '50px',
                          height: '50px',
                          padding: '0 12px',
                          borderRadius: '25px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          marginBottom: '12px',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        }}>
                          {startIndex + index + 1}
                        </div>
                        
                        {/* Sarlavha */}
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1890ff',
                          marginBottom: '12px',
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {article.title}
                        </h3>
                        
                        {/* Intro */}
                        {article.intro && (
                          <p style={{
                            color: '#666',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            marginBottom: '12px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {article.intro}
                          </p>
                        )}
                        
                        {/* O'qish link */}
                        <div style={{
                          color: '#1890ff',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: '500',
                          marginTop: '12px'
                        }}>
                          <BookOutlined /> To'liq o'qish
                        </div>
                      </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '40px',
              padding: '20px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <Pagination
                current={currentPage}
                total={allArticles.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                style={{
                  '& .ant-pagination-item': {
                    background: 'white',
                    border: 'none'
                  }
                }}
              />
            </div>
          </>
        ) : (
          <Empty
            description={
              <span style={{ color: 'white', fontSize: '16px' }}>
                Maqolalar topilmadi
              </span>
            }
            style={{ padding: '100px 0' }}
          />
        )}
      </div>

      {/* Maqola Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedArticle(null);
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
        closeIcon={<CloseOutlined style={{ fontSize: '20px' }} />}
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '20px' }}>Maqola yuklanmoqda...</p>
          </div>
        ) : selectedArticle && (
          <div>
            {/* Maqola matni */}
            <div style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#333',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedArticle.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Ramazon;
