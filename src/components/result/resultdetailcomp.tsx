// ============================================
// FILE: components/result/resultdetailcomp.tsx
// ============================================

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Judge {
  id: string;
  name: string;
  username: string;
}

interface Participant {
  id: string;
  booth_code: string;
  project_title: string;
  school: string;
  level: string;
  category: string;
  country: string;
}

interface Score {
  id: string;
  judge_id: string;
  team_id: string;
  total_score: string;
  scores_by_theme: string;
  raw_points: string;
  created_at: string;
  judges?: Judge;
}

interface JudgeAssignment {
  id: string;
  judge_id: string;
  team_id: string;
  status: string;
  created_at: string;
  judges?: Judge;
}

interface FinalScore {
  team_id: string;
  judge_1: string;
  judge_2: string;
  final_score: string;
  medal: string;
  created_at: string;
}

interface Theme {
  id: string;
  title: string;
  points: Array<{
    id: string;
    title: string;
  }>;
}

interface Template {
  id: string;
  level: string;
  name: string;
  structure: {
    themes: Theme[];
  };
}

const ResultDetailComp: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const participantId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (participantId) {
      fetchResultDetail();
    }
  }, [participantId]);

  const fetchResultDetail = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // ========== 1. FETCH PARTICIPANT DATA ==========
      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (participantError) {
        throw new Error('Failed to fetch participant data: ' + participantError.message);
      }

      setParticipant(participantData);

      // ========== 2. FETCH ASSESSMENT TEMPLATE ==========
      const { data: templateData, error: templateError } = await supabase
        .from('assessment_templates')
        .select('*')
        .eq('level', participantData.level)
        .single();

      if (templateError) {
        throw new Error('Failed to fetch assessment template: ' + templateError.message);
      }

      setTemplate(templateData);

      // ========== 3. FETCH JUDGE ASSIGNMENTS (dengan nama judge) ==========
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('judge_assignments')
        .select(`
          *,
          judges (
            id,
            name,
            username
          )
        `)
        .eq('team_id', participantId)
        .order('created_at', { ascending: true });

      if (assignmentsError) {
        throw new Error('Failed to fetch judge assignments: ' + assignmentsError.message);
      }

      setAssignments(assignmentsData || []);

      // ========== 4. FETCH ALL SCORES (dengan nama judge) ==========
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select(`
          *,
          judges (
            id,
            name,
            username
          )
        `)
        .eq('team_id', participantId);

      if (scoresError) {
        throw new Error('Failed to fetch scores: ' + scoresError.message);
      }

      setScores(scoresData || []);

      // ========== 5. FETCH FINAL SCORE ==========
      const { data: finalScoreData, error: finalScoreError } = await supabase
        .from('final_scores')
        .select('*')
        .eq('team_id', participantId)
        .single();

      if (finalScoreError) {
        console.warn('Final score not yet calculated:', finalScoreError.message);
        setFinalScore(null);
      } else {
        setFinalScore(finalScoreData);
      }

    } catch (error: any) {
      console.error('Error fetching result detail:', error);
      setErrorMessage(error.message || 'Failed to load assessment detail');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/result');
  };

  const getMedalBadge = (medal: string) => {
    switch (medal) {
      case 'Gold':
        return 'badge bg-warning text-dark';
      case 'Silver':
        return 'badge bg-secondary';
      case 'Bronze':
        return 'badge bg-danger';
      default:
        return 'badge bg-light text-dark';
    }
  };

  // ========== GET SCORE BY JUDGE ID ==========
  const getScoreByJudgeId = (judgeId: string): Score | null => {
    return scores.find(s => s.judge_id === judgeId) || null;
  };

  // ========== RENDER JUDGE SCORE CARD ==========
  const renderJudgeScoreCard = (assignment: JudgeAssignment | null, position: number) => {
    if (!assignment || !template) {
      return (
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Judge {position}
              </h5>
            </div>
            <div className="card-body text-center">
              <p className="text-muted">Not assigned</p>
            </div>
          </div>
        </div>
      );
    }

    const score = getScoreByJudgeId(assignment.judge_id);
    const judgeName = assignment.judges?.name || `Judge ${position}`;

    if (!score) {
      return (
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-warning">
              <h5 className="card-title mb-0 text-dark">
                <i className="bi bi-person-badge me-2"></i>
                Judge {position}
              </h5>
              <small className="text-dark">{judgeName}</small>
            </div>
            <div className="card-body text-center">
              <p className="text-muted">Not yet assessed</p>
            </div>
          </div>
        </div>
      );
    }

    const rawPoints = typeof score.raw_points === 'string' 
      ? JSON.parse(score.raw_points) 
      : score.raw_points;
    
    const scoresByTheme = typeof score.scores_by_theme === 'string' 
      ? JSON.parse(score.scores_by_theme) 
      : score.scores_by_theme;

    const themes = template.structure.themes;
    
    return (
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title mb-0">
                  <i className="bi bi-person-badge me-2"></i>
                  Judge {position}
                </h5>
                <small className="opacity-75">{judgeName}</small>
              </div>
              <div className="text-end">
                <small className="d-block opacity-75">Total Score</small>
                <h3 className="mb-0">{score.total_score}</h3>
              </div>
            </div>
          </div>
          <div className="card-body">
            {themes.map((theme, themeIndex) => (
              <div key={theme.id} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <h6 className="mb-0 fw-bold">{theme.title}</h6>
                  <span className="badge bg-primary rounded-pill">
                    {scoresByTheme[themeIndex] ? Number(scoresByTheme[themeIndex]).toFixed(1) : '0'} / 5
                  </span>
                </div>
                
                <div className="ms-3">
                  {theme.points.map((point, pointIndex) => {
                    const key = `${themeIndex}_${pointIndex}`;
                    const pointScore = rawPoints[key] || 0;
                    
                    return (
                      <div key={point.id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">{point.title}</small>
                        </div>
                        <div className="d-flex gap-1">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <div
                              key={num}
                              className={`flex-fill text-center py-2 rounded ${
                                num <= pointScore
                                  ? 'bg-primary text-white fw-bold'
                                  : 'bg-light text-muted'
                              }`}
                              style={{ fontSize: '0.85rem' }}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ========== CALCULATE DISPLAY VALUES ==========
  const judge1Assignment = assignments[0] || null;
  const judge2Assignment = assignments[1] || null;
  
  const judge1Score = judge1Assignment ? getScoreByJudgeId(judge1Assignment.judge_id) : null;
  const judge2Score = judge2Assignment ? getScoreByJudgeId(judge2Assignment.judge_id) : null;

  const judge1Value = judge1Score ? judge1Score.total_score : '-';
  const judge2Value = judge2Score ? judge2Score.total_score : '-';

  // Calculate final score manually if both judges scored
  let calculatedFinalScore = '-';
  let hasBothScores = false;
  
  if (judge1Score && judge2Score) {
    const avg = (parseFloat(judge1Score.total_score) + parseFloat(judge2Score.total_score)) / 2;
    calculatedFinalScore = avg.toFixed(2);
    hasBothScores = true;
  }

  const displayFinalScore = hasBothScores ? calculatedFinalScore : '-';
  const showMedal = hasBothScores && finalScore && finalScore.medal;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading assessment detail...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errorMessage}
        </div>
        <button onClick={handleBack} className="btn btn-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Results
        </button>
      </div>
    );
  }

  if (!participant || !template) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Result not found
        </div>
        <button onClick={handleBack} className="btn btn-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Results
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <button onClick={handleBack} className="btn btn-outline-secondary mb-3">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Results
        </button>
        <h2 className="fw-bold">
          <i className="bi bi-clipboard-data me-2"></i>
          Assessment Detail
        </h2>
      </div>

      {/* Participant Information */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0">
            <i className="bi bi-person-circle me-2"></i>
            Participant Information
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-muted small mb-1">Booth Code</label>
              <p className="fw-bold fs-5 mb-0">{participant.booth_code}</p>
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small mb-1">Project Title</label>
              <p className="fw-semibold mb-0">{participant.project_title}</p>
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small mb-1">School</label>
              <p className="fw-semibold mb-0">{participant.school}</p>
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small mb-1">Level</label>
              <p className="fw-semibold mb-0">{participant.level}</p>
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small mb-1">Category</label>
              <p className="fw-semibold mb-0">{participant.category}</p>
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small mb-1">Country</label>
              <p className="fw-semibold mb-0">{participant.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Score Summary */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body bg-primary bg-gradient text-white p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="fw-bold mb-3">
                <i className="bi bi-trophy-fill me-2"></i>
                Final Assessment
              </h4>
              <div className="row g-3">
                <div className="col-4">
                  <small className="d-block opacity-75">Judge 1</small>
                  <h2 className="fw-bold mb-0">{judge1Value}</h2>
                  {judge1Assignment && (
                    <small className="opacity-75">{judge1Assignment.judges?.name}</small>
                  )}
                </div>
                <div className="col-4">
                  <small className="d-block opacity-75">Judge 2</small>
                  <h2 className="fw-bold mb-0">{judge2Value}</h2>
                  {judge2Assignment && (
                    <small className="opacity-75">{judge2Assignment.judges?.name}</small>
                  )}
                </div>
                <div className="col-4">
                  <small className="d-block opacity-75">Final Score</small>
                  <h1 className="fw-bold mb-0">{displayFinalScore}</h1>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <i className="bi bi-award-fill" style={{ fontSize: '5rem' }}></i>
              <div className="mt-2">
                {showMedal ? (
                  <span className={`${getMedalBadge(finalScore.medal)} fs-4 px-4 py-2`}>
                    {finalScore.medal}
                  </span>
                ) : (
                  <span className="badge bg-secondary fs-6 px-3 py-2">
                    {hasBothScores ? 'Pending Medal' : 'Awaiting Assessment'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Judge Scores */}
      <h5 className="fw-bold mb-3">
        <i className="bi bi-bar-chart-fill me-2"></i>
        Detailed Scores by Judge
      </h5>
      <div className="row">
        {renderJudgeScoreCard(judge1Assignment, 1)}
        {renderJudgeScoreCard(judge2Assignment, 2)}
      </div>

      {/* Assessment Info */}
      <div className="card mt-4">
        <div className="card-header bg-success text-white">
          <h6 className="card-title mb-0">
            <i className="bi bi-check-circle-fill me-2"></i>
            Assessment Information
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <small className="text-muted d-block mb-1">Assessment Template</small>
              <p className="fw-semibold mb-0">{template.name} ({participant.level} Level)</p>
            </div>
            <div className="col-md-6">
              <small className="text-muted d-block mb-1">Assessment Status</small>
              <p className="fw-semibold mb-0">
                {hasBothScores ? (
                  <span className="badge bg-success">Fully Assessed</span>
                ) : scores.length > 0 ? (
                  <span className="badge bg-warning text-dark">Partially Assessed ({scores.length}/2)</span>
                ) : (
                  <span className="badge bg-secondary">Not Yet Assessed</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailComp;