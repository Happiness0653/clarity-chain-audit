;; ChainAudit Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-event (err u101))
(define-constant err-invalid-page (err u102))
(define-constant events-per-page u10)

;; Data structures
(define-map auditors principal bool)

(define-map audit-events uint {
  timestamp: uint,
  contract: principal,
  function: (string-ascii 64),
  caller: principal,
  details: (string-utf8 256)
})

(define-data-var event-counter uint u0)

;; Authorization check
(define-private (is-authorized)
  (or 
    (is-eq tx-sender contract-owner)
    (default-to false (map-get? auditors tx-sender))
  )
)

;; Add an authorized auditor
(define-public (add-auditor (new-auditor principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (ok (map-set auditors new-auditor true))
  )
)

;; Record an audit event
(define-public (record-event 
  (contract-id principal)
  (function-name (string-ascii 64))
  (details (string-utf8 256)))
  (let
    ((event-id (var-get event-counter)))
    (begin
      (asserts! (is-authorized) err-unauthorized)
      (map-set audit-events event-id {
        timestamp: block-height,
        contract: contract-id,
        function: function-name, 
        caller: tx-sender,
        details: details
      })
      (var-set event-counter (+ event-id u1))
      (ok event-id)
    )
  )
)

;; Get audit event by ID
(define-read-only (get-event (event-id uint))
  (ok (map-get? audit-events event-id))
)

;; Get total number of events
(define-read-only (get-event-count)
  (ok (var-get event-counter))
)

;; Get paginated events
(define-read-only (get-events-page (page uint))
  (let 
    (
      (start (* page events-per-page))
      (end (min (var-get event-counter) (+ start events-per-page)))
    )
    (begin
      (asserts! (< start (var-get event-counter)) err-invalid-page)
      (ok {
        total: (var-get event-counter),
        page: page,
        events: (map get-event-by-id (create-range start end))
      })
    )
  )
)

;; Helper to get event by ID
(define-private (get-event-by-id (id uint))
  (default-to 
    {
      timestamp: u0,
      contract: contract-owner,
      function: "",
      caller: contract-owner,
      details: ""
    }
    (map-get? audit-events id)
  )
)

;; Helper to create range
(define-private (create-range (start uint) (end uint))
  (list start)
)

;; Check if principal is an auditor
(define-read-only (is-auditor (account principal))
  (ok (default-to false (map-get? auditors account)))
)
