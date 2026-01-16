// TensorFlow.js 초기화 및 유틸리티
import * as tf from '@tensorflow/tfjs';

let isInitialized = false;

/**
 * TensorFlow.js 백엔드 초기화
 * WebGL 백엔드를 우선 사용하고, 실패 시 CPU 백엔드로 폴백
 */
export async function initTensorFlow(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    // WebGL 백엔드 시도
    await tf.setBackend('webgl');
    await tf.ready();

    console.log('[TensorFlow] Initialized with WebGL backend');
    isInitialized = true;
    return true;
  } catch (webglError) {
    console.warn('[TensorFlow] WebGL failed, trying CPU:', webglError);

    try {
      // CPU 백엔드로 폴백
      await tf.setBackend('cpu');
      await tf.ready();

      console.log('[TensorFlow] Initialized with CPU backend');
      isInitialized = true;
      return true;
    } catch (cpuError) {
      console.error('[TensorFlow] Failed to initialize:', cpuError);
      return false;
    }
  }
}

/**
 * TensorFlow.js 메모리 정리
 */
export function disposeTensorFlow(): void {
  tf.disposeVariables();
}

/**
 * 현재 메모리 사용량 확인
 */
export function getMemoryInfo(): tf.MemoryInfo {
  return tf.memory();
}

/**
 * 텐서 정리 유틸리티
 */
export function cleanupTensors(tensors: tf.Tensor[]): void {
  tensors.forEach(tensor => {
    if (tensor && !tensor.isDisposed) {
      tensor.dispose();
    }
  });
}

export { tf };
