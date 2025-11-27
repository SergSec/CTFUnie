<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/uploads/';
        
        // Crear directorio si no existe
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileName = $_FILES['file']['name'];
        $targetPath = $uploadDir . $fileName;
        
        // Mover archivo sin ninguna validación (VULNERABLE)
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
            $response['success'] = true;
            $response['message'] = 'Archivo subido correctamente';
            $response['file'] = array(
                'filename' => $fileName,
                'originalname' => $fileName,
                'path' => '/vulnerable/uploads/' . $fileName,
                'size' => $_FILES['file']['size']
            );
        } else {
            $response['success'] = false;
            $response['message'] = 'Error al mover el archivo';
        }
    } else {
        $response['success'] = false;
        $response['message'] = 'No se recibió ningún archivo o hubo un error';
        if (isset($_FILES['file'])) {
            $response['error_code'] = $_FILES['file']['error'];
        }
    }
} else {
    $response['success'] = false;
    $response['message'] = 'Método no permitido. Use POST.';
}

echo json_encode($response);
?>
