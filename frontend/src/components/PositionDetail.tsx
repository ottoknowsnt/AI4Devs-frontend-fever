import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Button,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import {
  getInterviewFlow,
  getPositionCandidates,
} from "../services/positionService";
import { updateCandidateStep } from "../services/candidateService";

// Tipos para TypeScript
interface Candidate {
  id: number;
  fullName: string;
  currentInterviewStep: string;
  applicationId: number;
  averageScore: number;
}

interface InterviewStep {
  id: number;
  name: string;
}

interface InterviewFlow {
  interviewFlow: {
    positionName: string;
    interviewFlow: {
      interviewSteps: InterviewStep[];
    };
  };
}

const PositionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewFlow, setInterviewFlow] = useState<InterviewFlow | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");

  useEffect(() => {
    // Si no hay ID, redirigir al listado de posiciones
    if (!id) {
      navigate("/positions");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [flowData, candidatesData] = await Promise.all([
          getInterviewFlow(parseInt(id, 10)),
          getPositionCandidates(parseInt(id, 10)),
        ]);
        setInterviewFlow(flowData);
        setCandidates(candidatesData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setError(
          "Ha ocurrido un error al cargar los datos. Por favor, inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Función para agrupar candidatos por fase
  const getCandidatesByStep = (stepName: string) => {
    return candidates.filter(
      (candidate) => candidate.currentInterviewStep === stepName
    );
  };

  // Renderizar la puntuación con color según valor
  const renderScore = (score: number) => {
    let color = "text-danger";
    if (score >= 7) {
      color = "text-success";
    } else if (score >= 5) {
      color = "text-warning";
    }
    return <span className={color}>{score.toFixed(1)}</span>;
  };

  // Función para manejar el inicio del arrastre
  const handleDragStart = (e: React.DragEvent<HTMLElement>, candidate: Candidate) => {
    e.dataTransfer.setData("candidateId", candidate.id.toString());
    e.dataTransfer.setData("applicationId", candidate.applicationId.toString());
  };

  // Función para permitir soltar elementos
  const allowDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  // Función para manejar el evento de soltar
  const handleDrop = async (e: React.DragEvent<HTMLElement>, targetStepId: number, targetStepName: string) => {
    e.preventDefault();
    const candidateId = parseInt(e.dataTransfer.getData("candidateId"), 10);
    const applicationId = parseInt(e.dataTransfer.getData("applicationId"), 10);
    
    // Buscar el candidato actual
    const candidateToUpdate = candidates.find(c => c.id === candidateId);
    
    // Verificar que no se está soltando en la misma fase
    if (candidateToUpdate && candidateToUpdate.currentInterviewStep === targetStepName) {
      return;
    }
    
    try {
      // Actualizar optimistamente en la UI
      const updatedCandidates = candidates.map(candidate => {
        if (candidate.id === candidateId) {
          return { ...candidate, currentInterviewStep: targetStepName };
        }
        return candidate;
      });
      
      setCandidates(updatedCandidates);
      
      // Enviar actualización al servidor
      await updateCandidateStep(candidateId, {
        applicationId: applicationId,
        currentInterviewStep: targetStepId
      });
      
      setToastVariant("success");
      setToastMessage("Candidato movido correctamente");
      setShowToast(true);
    } catch (error) {
      console.error("Error al actualizar la fase del candidato:", error);
      
      // Revertir cambios en la UI
      setToastVariant("danger");
      setToastMessage("Error al mover al candidato. Inténtalo de nuevo.");
      setShowToast(true);
      
      // Recargar los datos para asegurar consistencia
      if (id) {
        const candidatesData = await getPositionCandidates(parseInt(id, 10));
        setCandidates(candidatesData);
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/positions">
          <Button variant="primary">Volver al listado</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4 mb-5">
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide 
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">Notificación</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === "danger" ? "text-white" : ""}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/positions" className="text-decoration-none">
            <Button variant="outline-secondary" size="sm" className="me-2">
              &larr; Volver
            </Button>
          </Link>
          <h2 className="d-inline">
            {interviewFlow?.interviewFlow.positionName || "Detalle de posición"}
          </h2>
        </div>
      </div>

      {/* Vista de escritorio: Columnas horizontales */}
      <div className="d-none d-md-block">
        <Row className="g-4">
          {interviewFlow?.interviewFlow.interviewFlow.interviewSteps.map((step) => (
            <Col
              key={step.id}
              md={12 / interviewFlow.interviewFlow.interviewFlow.interviewSteps.length}
            >
              <Card 
                className="shadow-sm h-100"
                onDragOver={allowDrop}
                onDrop={(e) => handleDrop(e, step.id, step.name)}
              >
                <Card.Header className="bg-light text-center">
                  <strong>{step.name}</strong>
                  <Badge bg="primary" pill className="ms-2">
                    {getCandidatesByStep(step.name).length}
                  </Badge>
                </Card.Header>
                <Card.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  {getCandidatesByStep(step.name).length > 0 ? (
                    getCandidatesByStep(step.name).map((candidate) => (
                      <Card 
                        key={candidate.id} 
                        className="mb-2 shadow-sm" 
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
                        style={{ cursor: "grab" }}
                      >
                        <Card.Body>
                          <Card.Title className="fs-6">
                            {candidate.fullName}
                          </Card.Title>
                          <Card.Text className="mb-0 small">
                            Puntuación: {renderScore(candidate.averageScore)}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-muted py-3">
                      <em>No hay candidatos en esta fase</em>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Vista móvil: Columnas verticales */}
      <div className="d-md-none">
        {interviewFlow?.interviewFlow.interviewFlow.interviewSteps.map((step) => (
          <Card 
            key={step.id} 
            className="shadow-sm mb-4"
            onDragOver={allowDrop}
            onDrop={(e) => handleDrop(e, step.id, step.name)}
          >
            <Card.Header className="bg-light">
              <strong>{step.name}</strong>
              <Badge bg="primary" pill className="ms-2">
                {getCandidatesByStep(step.name).length}
              </Badge>
            </Card.Header>
            <Card.Body>
              {getCandidatesByStep(step.name).length > 0 ? (
                getCandidatesByStep(step.name).map((candidate) => (
                  <Card 
                    key={candidate.id} 
                    className="mb-2 shadow-sm"
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate)}
                    style={{ cursor: "grab" }}
                  >
                    <Card.Body>
                      <Card.Title className="fs-6">
                        {candidate.fullName}
                      </Card.Title>
                      <Card.Text className="mb-0 small">
                        Puntuación: {renderScore(candidate.averageScore)}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  <em>No hay candidatos en esta fase</em>
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default PositionDetail;
