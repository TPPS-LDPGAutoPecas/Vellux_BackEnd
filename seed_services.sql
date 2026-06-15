-- Limpar dados existentes (cascata devido a chaves estrangeiras, se configurado, ou apagar na ordem certa)
DELETE FROM technical_reports;
DELETE FROM spare_parts;
DELETE FROM service_logs;
DELETE FROM service_mechanics;
DELETE FROM services;

-- Resetar sequências
ALTER SEQUENCE services_id_seq RESTART WITH 1;
ALTER SEQUENCE technical_reports_id_seq RESTART WITH 1;

-- Inserir Serviços Anteriores (Meses Passados)
INSERT INTO services (client_id, vehicle_id, title, description, status, scheduled_date, start_date, finished_at, budget, evaluation_rating) VALUES
(5, 1, 'Revisão Preventiva', 'Troca de óleo, filtros e verificação geral', 'completed', CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE - INTERVAL '5 months' + INTERVAL '2 days', 850.00, 5),
(6, 2, 'Troca de Suspensão', 'Amortecedores dianteiros', 'completed', CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE - INTERVAL '4 months' + INTERVAL '3 days', 1850.00, 4),
(7, 3, 'Alinhamento e Balanceamento', 'Serviço de rotina', 'completed', CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE - INTERVAL '4 months' + INTERVAL '1 day', 200.00, 5),
(5, 1, 'Reparo Sistema Elétrico', 'Bateria e alternador', 'completed', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE - INTERVAL '3 months' + INTERVAL '2 days', 1200.00, 3),
(6, 2, 'Estética Automotiva', 'Polimento cristalizado', 'completed', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE - INTERVAL '3 months' + INTERVAL '1 day', 600.00, 5),
(7, 3, 'Revisão Preventiva', 'Revisão 40.000km', 'completed', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE - INTERVAL '2 months' + INTERVAL '2 days', 950.00, 4),
(9, 4, 'Troca de Pastilhas', 'Freio dianteiro e traseiro', 'completed', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE - INTERVAL '2 months' + INTERVAL '1 day', 450.00, 5),
(5, 1, 'Higienização Interna', 'Limpeza de estofados', 'completed', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE - INTERVAL '1 month' + INTERVAL '1 day', 350.00, 5),
(6, 2, 'Reparo de Câmbio', 'Troca de óleo e filtro', 'completed', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE - INTERVAL '1 month' + INTERVAL '4 days', 2100.00, 4),
(7, 3, 'Revisão Preventiva', 'Revisão 50.000km', 'completed', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '14 days', 1100.00, 5);

-- Inserir Serviços Recentes (Este Mês/Semana)
INSERT INTO services (client_id, vehicle_id, title, description, status, scheduled_date, start_date, finished_at, budget, evaluation_rating) VALUES
(9, 4, 'Troca de Suspensão', 'Amortecedores traseiros', 'completed', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '8 days', 1600.00, 4),
(5, 1, 'Estética Automotiva', 'Lavagem detalhada', 'completed', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '7 days', 250.00, 5),
(6, 2, 'Reparo Sistema Elétrico', 'Troca de lâmpadas LED', 'completed', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days', 300.00, 5),
(7, 3, 'Revisão Preventiva', 'Revisão pré-viagem', 'completed', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days', 750.00, 4),
(9, 4, 'Alinhamento e Balanceamento', 'Serviço rápido', 'completed', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 220.00, 5);

-- Alguns serviços em andamento para dar realismo (não entram no dashboard de faturamento real)
INSERT INTO services (client_id, vehicle_id, title, description, status, scheduled_date, start_date, expected_delivery) VALUES
(5, 1, 'Troca de Óleo', 'Óleo sintético', 'in_progress', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
(6, 2, 'Revisão Completa', 'Preparação para venda', 'pending', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days');

-- Associar mecânicos aos serviços completados
INSERT INTO service_mechanics (service_id, mechanic_id) VALUES
(1, 2), (2, 3), (3, 4), (4, 11), (5, 2), 
(6, 3), (7, 4), (8, 11), (9, 2), (10, 3),
(11, 4), (12, 11), (13, 2), (14, 3), (15, 4);

-- Inserir Laudos Técnicos (Technical Reports) para serviços completados
INSERT INTO technical_reports (service_id, service_name, procedures, diagnostics, observations, final_value, created_at) VALUES
(1, 'Revisão Preventiva', '["Troca de óleo", "Filtro de ar"]', 'Tudo ok', 'Nenhuma observação', 850.00, CURRENT_DATE - INTERVAL '5 months' + INTERVAL '2 days'),
(2, 'Troca de Suspensão', '["Amortecedores Dianteiros"]', 'Amortecedores vazando', 'Recomenda-se trocar os traseiros em breve', 1850.00, CURRENT_DATE - INTERVAL '4 months' + INTERVAL '3 days'),
(3, 'Alinhamento e Balanceamento', '["Alinhamento 3D"]', 'Desalinhado 2 graus', 'Nenhuma', 200.00, CURRENT_DATE - INTERVAL '4 months' + INTERVAL '1 day'),
(4, 'Reparo Sistema Elétrico', '["Troca Bateria"]', 'Bateria sem carga', 'Nenhuma', 1200.00, CURRENT_DATE - INTERVAL '3 months' + INTERVAL '2 days'),
(5, 'Estética Automotiva', '["Polimento"]', 'Riscos superficiais', 'Vitrificação recomendada', 600.00, CURRENT_DATE - INTERVAL '3 months' + INTERVAL '1 day'),
(6, 'Revisão Preventiva', '["Geral"]', 'Desgaste natural', 'Nenhuma', 950.00, CURRENT_DATE - INTERVAL '2 months' + INTERVAL '2 days'),
(7, 'Troca de Pastilhas', '["Pastilhas Cerâmica"]', 'Pastilhas gastas', 'Discos ok', 450.00, CURRENT_DATE - INTERVAL '2 months' + INTERVAL '1 day'),
(8, 'Higienização Interna', '["Ozônio"]', 'Odor', 'Limpeza profunda concluída', 350.00, CURRENT_DATE - INTERVAL '1 month' + INTERVAL '1 day'),
(9, 'Reparo de Câmbio', '["Óleo Câmbio"]', 'Óleo escuro', 'Troca total feita com máquina', 2100.00, CURRENT_DATE - INTERVAL '1 month' + INTERVAL '4 days'),
(10, 'Revisão Preventiva', '["Geral"]', 'Tudo dentro do esperado', 'Nenhuma', 1100.00, CURRENT_DATE - INTERVAL '14 days'),
(11, 'Troca de Suspensão', '["Amortecedores Traseiros"]', 'Vazamento crônico', 'Trocar batentes também', 1600.00, CURRENT_DATE - INTERVAL '8 days'),
(12, 'Estética Automotiva', '["Lavagem"]', 'Sujeira extrema', 'Feito detailing interno', 250.00, CURRENT_DATE - INTERVAL '7 days'),
(13, 'Reparo Sistema Elétrico', '["Lâmpadas"]', 'Queimadas', 'Nenhuma', 300.00, CURRENT_DATE - INTERVAL '5 days'),
(14, 'Revisão Preventiva', '["Checkup Viagem"]', 'Pneus bons, óleo ok', 'Pronto para viagem longa', 750.00, CURRENT_DATE - INTERVAL '2 days'),
(15, 'Alinhamento e Balanceamento', '["Alinhamento"]', 'Puxando para direita', 'Corrigido', 220.00, CURRENT_DATE - INTERVAL '1 day');
