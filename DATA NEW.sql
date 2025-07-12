USE avocapp_db;

-- Trigger para actualizar inventario después de una entrada
DELIMITER //
CREATE TRIGGER tr_after_insert_entrada
AFTER INSERT ON entradas
FOR EACH ROW
BEGIN
    UPDATE inventario 
    SET cantidad_disponible = cantidad_disponible + NEW.cantidad
    WHERE fecha = CURDATE();
    
    IF ROW_COUNT() = 0 THEN
        INSERT INTO inventario (fecha, cantidad_disponible)
        VALUES (CURDATE(), NEW.cantidad);
    END IF;
END //
DELIMITER ;

-- Trigger para actualizar inventario después de una salida
DELIMITER //
CREATE TRIGGER tr_after_insert_salida
AFTER INSERT ON salidas
FOR EACH ROW
BEGIN
    UPDATE inventario 
    SET cantidad_disponible = cantidad_disponible - NEW.cantidad
    WHERE fecha = CURDATE();
    
    IF ROW_COUNT() = 0 THEN
        DECLARE v_total_entradas DECIMAL(10,2);
        DECLARE v_total_salidas DECIMAL(10,2);
        
        SELECT SUM(cantidad) INTO v_total_entradas FROM entradas;
        SELECT IFNULL(SUM(cantidad), 0) INTO v_total_salidas FROM salidas;
        
        INSERT INTO inventario (fecha, cantidad_disponible)
        VALUES (CURDATE(), v_total_entradas - v_total_salidas);
    END IF;
END //
DELIMITER ;