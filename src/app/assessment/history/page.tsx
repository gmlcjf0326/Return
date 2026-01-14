'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card, CardHeader, CardContent, StatusBadge } from '@/components/ui';

interface AssessmentRecord {
  id: number;
  totalScore: number | null;
  riskLevel: string | null;
  createdAt: string;
}

export default function AssessmentHistoryPage() {
  const { session, isInitialized, initSession } = useSessionStore();
  const [history, setHistory] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      initSession();
    }
  }, [isInitialized, initSession]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/assessment/history?sessionId=${session.id}`);
        const data = await response.json();

        if (data.success) {
          setHistory(data.data || []);
        } else {
          setError(data.error?.message || '이력을 불러오지 못했습니다.');
        }
      } catch {
        setError('서버 연결에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (session?.id) {
      fetchHistory();
    }
  }, [session?.id]);

  const getRiskLevelBadge = (riskLevel: string | null) => {
    switch (riskLevel) {
      case 'normal':
        return <StatusBadge status="normal">정상</StatusBadge>;
      case 'mild_caution':
        return <StatusBadge status="warning">경도 주의</StatusBadge>;
      case 'mci_suspected':
        return <StatusBadge status="error">MCI 의심</StatusBadge>;
      case 'consultation_recommended':
        return <StatusBadge status="error">상담 권장</StatusBadge>;
      default:
        return <StatusBadge status="inactive">미분류</StatusBadge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-full bg-[var(--neutral-50)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-block">
            &larr; 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-[var(--neutral-800)]">진단 이력</h1>
          <p className="text-[var(--neutral-500)] mt-2">Assessment History</p>
        </div>

        {/* Content */}
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[var(--primary-light)] border-t-[var(--primary)] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[var(--neutral-500)]">이력을 불러오는 중...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--neutral-800)] mb-2">오류 발생</h2>
              <p className="text-[var(--neutral-600)]">{error}</p>
            </CardContent>
          </Card>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-4">진단 기록이 없습니다</h2>
              <p className="text-[var(--neutral-600)] mb-6 max-w-md mx-auto">
                아직 진단을 받은 적이 없습니다.
                첫 번째 인지 진단을 시작해보세요.
              </p>
              <Link href="/assessment">
                <Button variant="primary" size="lg">
                  첫 진단 시작하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-[var(--neutral-800)]">
                          {record.totalScore ?? '--'}점
                        </span>
                        {getRiskLevelBadge(record.riskLevel)}
                      </div>
                      <p className="text-sm text-[var(--neutral-500)]">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                    <Link href={`/assessment/result?id=${record.id}`}>
                      <Button variant="outline" size="sm">
                        상세 보기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              홈으로 돌아가기
            </Button>
          </Link>
          <Link href="/assessment">
            <Button variant="primary" size="lg">
              새 진단 시작
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
