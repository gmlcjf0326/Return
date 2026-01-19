// TensorFlow.js 초기화 및 유틸리티 (지연 로딩)

// 지연 로딩된 TensorFlow 인스턴스
let tfInstance: typeof import('@tensorflow/tfjs') | null = null;
let isInitialized = false;
let initPromise: Promise<boolean> | null = null;

/**
 * TensorFlow.js 모듈 지연 로딩
 * 첫 사용 시에만 500KB+ 라이브러리를 로드
 */
async function loadTensorFlow(): Promise<typeof import('@tensorflow/tfjs')> {
  if (tfInstance) return tfInstance;

  tfInstance = await import('@tensorflow/tfjs');
  return tfInstance;
}

/**
 * TensorFlow.js 백엔드 초기화
 * WebGL 백엔드를 우선 사용하고, 실패 시 CPU 백엔드로 폴백
 */
export async function initTensorFlow(): Promise<boolean> {
  if (isInitialized) return true;

  // 중복 초기화 방지
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const tf = await loadTensorFlow();

      // WebGL 백엔드 시도
      await tf.setBackend('webgl');
      await tf.ready();

      console.log('[TensorFlow] Initialized with WebGL backend');
      isInitialized = true;
      return true;
    } catch (webglError) {
      console.warn('[TensorFlow] WebGL failed, trying CPU:', webglError);

      try {
        const tf = await loadTensorFlow();

        // CPU 백엔드로 폴백
        await tf.setBackend('cpu');
        await tf.ready();

        console.log('[TensorFlow] Initialized with CPU backend');
        isInitialized = true;
        return true;
      } catch (cpuError) {
        console.error('[TensorFlow] Failed to initialize:', cpuError);
        initPromise = null;
        return false;
      }
    }
  })();

  return initPromise;
}

/**
 * TensorFlow.js 메모리 정리
 */
export async function disposeTensorFlow(): Promise<void> {
  if (tfInstance) {
    tfInstance.disposeVariables();
  }
}

/**
 * 현재 메모리 사용량 확인
 */
export async function getMemoryInfo(): Promise<import('@tensorflow/tfjs').MemoryInfo | null> {
  if (!tfInstance) return null;
  return tfInstance.memory();
}

/**
 * 텐서 정리 유틸리티
 */
export async function cleanupTensors(tensors: import('@tensorflow/tfjs').Tensor[]): Promise<void> {
  tensors.forEach(tensor => {
    if (tensor && !tensor.isDisposed) {
      tensor.dispose();
    }
  });
}

/**
 * TensorFlow 인스턴스 가져오기 (이미 로드된 경우만)
 */
export function getTf(): typeof import('@tensorflow/tfjs') | null {
  return tfInstance;
}

/**
 * TensorFlow 인스턴스 가져오기 (필요시 로드)
 */
export async function getTfAsync(): Promise<typeof import('@tensorflow/tfjs')> {
  return loadTensorFlow();
}
